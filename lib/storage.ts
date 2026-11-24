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
    // If it is a non-image file (e.g. PDF), skip canvas compression
    if (fileOrDataUrl instanceof File && !fileOrDataUrl.type.startsWith("image/")) {
      return reject(new Error("File is not an image; skipping compression."));
    }

    if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:application/pdf")) {
      return reject(new Error("Data URL is a PDF; skipping compression."));
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        if (width <= 0 || height <= 0) {
          return reject(new Error("Invalid image dimensions."));
        }

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
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error("Image format could not be decoded by browser canvas."));
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
 * Uploads media (images or documents) to Supabase Storage via /api/upload server route.
 * Automatically compresses raster images; safely passes through PDFs and uncompressed files without error.
 */
export async function uploadMediaToStorage(
  fileOrDataUrl: File | string,
  bucket: "avatars" | "documents" | "caregiver-documents" | "chat_attachments" = "caregiver-documents",
  pathPrefix: string = "user"
): Promise<string> {
  // If it's already a hosted URL (e.g. preset avatar or external URL), return it directly
  if (typeof fileOrDataUrl === "string" && (fileOrDataUrl.startsWith("http://") || fileOrDataUrl.startsWith("https://"))) {
    return fileOrDataUrl;
  }

  // Normalize bucket: use caregiver-documents for document files
  const targetBucket = bucket === "documents" ? "caregiver-documents" : bucket;
  const isDoc = targetBucket === "caregiver-documents";
  const maxWidth = targetBucket === "avatars" ? 400 : 1200;
  const maxHeight = targetBucket === "avatars" ? 400 : 1200;

  let fileToUpload: Blob | File;
  let uploadFileName = "upload.jpg";

  if (typeof fileOrDataUrl === "string") {
    // If it's a data URL
    if (fileOrDataUrl.startsWith("data:application/pdf")) {
      // Base64 PDF: convert directly to blob without image compression
      const byteCharacters = atob(fileOrDataUrl.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      fileToUpload = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
      uploadFileName = "document.pdf";
    } else {
      // Try image compression, with safe fallback to raw blob if canvas compression fails
      try {
        fileToUpload = await compressImage(fileOrDataUrl, maxWidth, maxHeight, 0.8);
      } catch (e) {
        console.warn("[uploadMediaToStorage] Compression skipped, converting dataUrl directly:", e);
        const parts = fileOrDataUrl.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const byteCharacters = atob(parts[1] || "");
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        fileToUpload = new Blob([new Uint8Array(byteNumbers)], { type: mime });
      }
    }
  } else {
    // It's a File object
    const isPdf = fileOrDataUrl.type === "application/pdf" || fileOrDataUrl.name.toLowerCase().endsWith(".pdf");
    uploadFileName = fileOrDataUrl.name || (isPdf ? "document.pdf" : "upload.jpg");

    if (fileOrDataUrl.type.startsWith("image/")) {
      try {
        fileToUpload = await compressImage(fileOrDataUrl, maxWidth, maxHeight, 0.8);
      } catch (compressErr) {
        // Fallback safely to original image if compression fails
        console.warn("[uploadMediaToStorage] Image compression skipped, using original file:", compressErr);
        fileToUpload = fileOrDataUrl;
      }
    } else {
      // Non-image file (PDF / DOC): upload directly as binary
      fileToUpload = fileOrDataUrl;
    }
  }

  // Upload via /api/upload server endpoint
  const formData = new FormData();
  formData.append("file", fileToUpload, uploadFileName);
  formData.append("bucket", targetBucket);
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
        const finalUrl = data.data?.url || data.url || data.path || "";
        return isDoc ? (data.data?.path || data.path || finalUrl) : finalUrl;
      } else {
        const errData = await res.json().catch(() => ({}));
        lastError = errData.error?.message || errData.error || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      lastError = err.message || err;
    }

    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.error(`[uploadMediaToStorage] Failed to upload to bucket '${targetBucket}':`, lastError);
  throw new Error(`Upload failed: ${lastError}. Please try again.`);
}
