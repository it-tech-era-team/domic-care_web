import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const bucket = (formData.get("bucket") as string) || "avatars";
    const pathPrefix = (formData.get("pathPrefix") as string) || "user";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Ensure bucket exists or create it with public access if missing
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === bucket);

      if (!bucketExists) {
        await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit
        });
      }
    } catch (e) {
      // Ignore bucket list/create error if already exists
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 7);
    const fileName = `${pathPrefix}_${timestamp}_${randomStr}.jpg`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        upsert: true,
        contentType: file.type || "image/jpeg",
        cacheControl: "360000",
      });

    if (error) {
      console.error(`[POST /api/upload] Storage upload error for bucket '${bucket}':`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json({
      url: publicData.publicUrl,
      path: `${bucket}/${fileName}`,
    });
  } catch (err: any) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
