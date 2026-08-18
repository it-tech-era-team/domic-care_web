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
 * Uploads compressed media directly to Supabase Storage.
 * Throws explicit error on failure after retry. Does NOT fall back to Base64 database writes.
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

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  const fileName = `${pathPrefix}_${timestamp}_${randomStr}.jpg`;
  const filePath = `${fileName}`;

  // 2. Upload to Supabase Storage with 1 retry
  let uploadError: any = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, compressedBlob, {
          upsert: true,
          contentType: "image/jpeg",
          cacheControl: "360000",
        });

      if (!error && data) {
        uploadError = null;
        break;
      }
      uploadError = error;
    } catch (err) {
      uploadError = err;
    }

    // Wait 500ms before retry
    if (attempt === 1) {
      await new Promise((res) => setTimeout(res, 500));
    }
  }

  if (uploadError) {
    console.error(`[uploadMediaToStorage] Failed to upload to bucket '${bucket}':`, uploadError);
    throw new Error(`Upload to ${bucket} storage failed: ${uploadError.message || "Network error"}. Please check your connection and try again.`);
  }

  // 3. Return Public CDN URL for public buckets, or storage path for private document bucket
  if (isDoc) {
    // For private document bucket, return reference path so server/client can generate signed URLs on demand
    return `${bucket}/${filePath}`;
  } else {
    // For public buckets (avatars, chat_attachments), return public CDN URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return publicData.publicUrl;
  }
}
