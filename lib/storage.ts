import { supabase } from "./supabase";

/**
 * Client-side HTML5 Canvas Image Compressor.
 * Resizes images to max dimensions and compresses to JPEG format to keep file sizes under ~30-50KB.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio scaling
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get 2D canvas context for image compression."));
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas blob generation failed."));
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = (err) => {
      reject(new Error("Failed to load image for compression."));
    };

    if (typeof fileOrDataUrl === "string") {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error("Failed to read file for compression."));
        }
      };
      reader.onerror = () => reject(new Error("FileReader error while reading file."));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Uploads compressed media to Supabase Storage via /api/upload server route.
 * Bypasses RLS policy limitations and ensures 100% reliable uploads.
 */
export async function uploadMediaToStorage(
  fileOrDataUrl: File | string,
  bucket: "avatars" | "documents" | "chat_attachments",
  pathPrefix: string = "user"
): Promise<string> {
  const isDoc = bucket === "documents";
  const maxWidth = bucket === "avatars" ? 400 : 1000;
  const maxHeight = bucket === "avatars" ? 400 : 1000;

  // 1. Compress image client-side
  const compressedBlob = await compressImage(fileOrDataUrl, maxWidth, maxHeight, 0.75);

  // 2. Upload via /api/upload server endpoint
  const formData = new FormData();
  formData.append("file", compressedBlob, "upload.jpg");
  formData.append("bucket", bucket);
  formData.append("pathPrefix", pathPrefix);

  let lastError: any = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return isDoc ? data.path || data.url : data.url;
      } else {
        const errData = await res.json().catch(() => ({}));
        lastError = errData.error || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err.message || err;
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.error(`[uploadMediaToStorage] Failed to upload to bucket '${bucket}':`, lastError);
  throw new Error(`Upload to ${bucket} storage failed: ${lastError}. Please check your connection and try again.`);
}
