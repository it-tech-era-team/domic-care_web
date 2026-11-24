import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { apiSuccess, apiError } from "@/lib/api-response";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | Blob | null;
    const bucket = (formData.get("bucket") as string) || "caregiver-documents";
    const pathPrefix = (formData.get("pathPrefix") as string) || "doc";

    if (!file) {
      return apiError("MISSING_FILE", "No file was provided in the upload request.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("FILE_TOO_LARGE", "The selected file exceeds the maximum allowed size of 10MB.", 400);
    }

    // Determine MIME type and safe extension
    const mimeType = file.type || "application/octet-stream";
    const ext = ALLOWED_MIME_TYPES[mimeType] || (file instanceof File && file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg");

    if (!["jpg", "jpeg", "png", "pdf"].includes(ext || "")) {
      return apiError("INVALID_FILE_TYPE", "Only JPG, PNG images and PDF documents are supported.", 400);
    }

    const supabase = createServerSupabaseClient();

    // Ensure bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === bucket);
      if (!bucketExists) {
        const isPublic = bucket === "avatars" || bucket === "chat";
        await supabase.storage.createBucket(bucket, {
          public: isPublic,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
        });
      }
    } catch {
      // Bucket check error ignored
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const fileName = `${pathPrefix}_${timestamp}_${randomStr}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        upsert: true,
        contentType: mimeType,
        cacheControl: "3600",
      });

    if (error) {
      return apiError("UPLOAD_FAILED", error.message || "Failed to upload file to storage.", 500, error);
    }

    let fileUrl = "";
    if (bucket === "caregiver-documents") {
      // Private bucket: create a signed URL valid for 2 hours
      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(fileName, 7200);
      fileUrl = signedData?.signedUrl || "";
    } else {
      // Public bucket
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      fileUrl = publicData.publicUrl;
    }

    return apiSuccess({
      url: fileUrl,
      path: `${bucket}/${fileName}`,
      fileName,
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "An error occurred while uploading file.", 500, err);
  }
}
