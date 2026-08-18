import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Manually load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
      }
    });
  }
} catch (e) {
  // Ignore env read failure
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function base64ToBuffer(dataUri: string): { buffer: Buffer; mime: string } {
  const matches = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid base64 Data URI format");
  }
  const mime = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  return { buffer, mime };
}

async function ensureBucketExists(bucketName: string, isPublic: boolean) {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(bucketName);
    if (error || !bucket) {
      console.log(`🔨 Bucket '${bucketName}' not found. Attempting to create bucket (public: ${isPublic})...`);
      const { error: createErr } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10485760, // 10MB limit
      });
      if (createErr) {
        console.error(`⚠️ Could not auto-create bucket '${bucketName}': ${createErr.message}`);
        console.error(`👉 Please create the bucket '${bucketName}' (public: ${isPublic}) in your Supabase Dashboard -> Storage.`);
      } else {
        console.log(`✅ Successfully created storage bucket '${bucketName}'.`);
      }
    }
  } catch (err) {
    console.error(`Error checking bucket '${bucketName}':`, err);
  }
}

async function runMigration() {
  console.log("🚀 Starting Base64 to Supabase Storage Backfill Migration...");

  // Ensure storage buckets exist
  await ensureBucketExists("avatars", true);
  await ensureBucketExists("documents", false);
  await ensureBucketExists("chat_attachments", true);

  let totalMigrated = 0;

  // 1. Migrate Profiles Avatars
  console.log("\n📦 [1/3] Scanning profiles.avatar_url for base64 strings...");
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, avatar_url")
    .like("avatar_url", "data:%");

  if (pErr) {
    console.error("Error fetching profiles:", pErr);
  } else if (profiles && profiles.length > 0) {
    console.log(`Found ${profiles.length} profiles with base64 avatars.`);
    for (const p of profiles) {
      try {
        const { buffer, mime } = base64ToBuffer(p.avatar_url);
        const ext = mime.split("/")[1] || "jpg";
        const filePath = `profile_${p.id}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, buffer, { upsert: true, contentType: mime });

        if (upErr) {
          console.error(`Failed to upload avatar for profile ${p.id}:`, upErr);
          continue;
        }

        const { data: pubData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        const publicUrl = pubData.publicUrl;

        await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
          .eq("id", p.id);

        console.log(`✅ Migrated profile avatar for ID ${p.id} -> ${publicUrl}`);
        totalMigrated++;
      } catch (err) {
        console.error(`Failed to migrate profile ${p.id}:`, err);
      }
    }
  } else {
    console.log("No base64 avatars found in profiles.");
  }

  // 2. Migrate Caregiver Documents (Private Bucket)
  console.log("\n📦 [2/3] Scanning caregiver_documents.file_url for base64 strings...");
  const { data: docs, error: dErr } = await supabase
    .from("caregiver_documents")
    .select("id, file_url")
    .like("file_url", "data:%");

  if (dErr) {
    console.error("Error fetching caregiver_documents:", dErr);
  } else if (docs && docs.length > 0) {
    console.log(`Found ${docs.length} caregiver documents with base64 URLs.`);
    for (const d of docs) {
      try {
        const { buffer, mime } = base64ToBuffer(d.file_url);
        const ext = mime.split("/")[1] || "jpg";
        const filePath = `doc_${d.id}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("documents")
          .upload(filePath, buffer, { upsert: true, contentType: mime });

        if (upErr) {
          console.error(`Failed to upload document ${d.id}:`, upErr);
          continue;
        }

        const storagePath = `documents/${filePath}`;
        await supabase
          .from("caregiver_documents")
          .update({ file_url: storagePath })
          .eq("id", d.id);

        console.log(`✅ Migrated document for ID ${d.id} -> ${storagePath}`);
        totalMigrated++;
      } catch (err) {
        console.error(`Failed to migrate document ${d.id}:`, err);
      }
    }
  } else {
    console.log("No base64 files found in caregiver_documents.");
  }

  // 3. Migrate Chat Message Attachments
  console.log("\n📦 [3/3] Scanning messages.message for base64 image strings...");
  const { data: msgs, error: mErr } = await supabase
    .from("messages")
    .select("id, message")
    .like("message", "data:%");

  if (mErr) {
    console.error("Error fetching messages:", mErr);
  } else if (msgs && msgs.length > 0) {
    console.log(`Found ${msgs.length} chat messages with base64 image attachments.`);
    for (const m of msgs) {
      try {
        const { buffer, mime } = base64ToBuffer(m.message);
        const ext = mime.split("/")[1] || "jpg";
        const filePath = `msg_${m.id}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("chat_attachments")
          .upload(filePath, buffer, { upsert: true, contentType: mime });

        if (upErr) {
          console.error(`Failed to upload message attachment ${m.id}:`, upErr);
          continue;
        }

        const { data: pubData } = supabase.storage.from("chat_attachments").getPublicUrl(filePath);
        const publicUrl = pubData.publicUrl;

        await supabase
          .from("messages")
          .update({ message: publicUrl })
          .eq("id", m.id);

        console.log(`✅ Migrated chat image for message ID ${m.id} -> ${publicUrl}`);
        totalMigrated++;
      } catch (err) {
        console.error(`Failed to migrate message ${m.id}:`, err);
      }
    }
  } else {
    console.log("No base64 attachments found in messages.");
  }

  console.log(`\n🎉 Backfill Migration Complete! Total Base64 records converted: ${totalMigrated}`);
}

runMigration().catch((err) => {
  console.error("Migration Script Error:", err);
  process.exit(1);
});
