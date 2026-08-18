import { supabase } from "./supabase";

/**
 * Generates a short-lived signed URL (default 5 min expiry) for private verification documents.
 * Accepts either a storage path (e.g. "documents/cg_123.jpg"), a legacy public URL, or raw string.
 */
export async function getSignedDocumentUrl(
  fileUrlOrPath: string,
  expiresInSeconds: number = 300
): Promise<string> {
  if (!fileUrlOrPath) return "";

  // If it's already a full HTTP URL (external placeholder or legacy public URL) or base64 (migration pending)
  if (fileUrlOrPath.startsWith("http://") || fileUrlOrPath.startsWith("https://") || fileUrlOrPath.startsWith("data:")) {
    return fileUrlOrPath;
  }

  // Parse path: e.g. "documents/cg_123.jpg" or "cg_123.jpg"
  let cleanPath = fileUrlOrPath;
  if (cleanPath.startsWith("documents/")) {
    cleanPath = cleanPath.replace("documents/", "");
  }

  try {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(cleanPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error("[getSignedDocumentUrl] Failed to generate signed URL:", error);
      return fileUrlOrPath;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("[getSignedDocumentUrl] Exception generating signed URL:", err);
    return fileUrlOrPath;
  }
}
