import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Manually parse .env.local
const envFile = fs.readFileSync(".env.local", "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const url = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const serviceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

console.log("Supabase URL:", url);
console.log("Service Key Length:", serviceKey ? serviceKey.length : 0);

// Initialize with Service Role Key
const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function runDiagnostics() {
  try {
    console.log("\n--- Testing direct creation via Auth Admin ---");
    const testEmail = `admin_test_${Math.floor(Math.random() * 100000)}@example.com`;
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: "password123",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin Diagnostic User",
        role: "user",
      }
    });

    if (error) {
      console.error("Auth Admin Error Details:", error);
    } else {
      console.log("Auth Admin Success! User created with ID:", data.user?.id);
      
      // Check if profile was created
      const { data: profile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", data.user?.id)
        .single();
        
      if (profileErr) {
        console.error("Profile lookup error after success:", profileErr);
      } else {
        console.log("Associated Profile Row:", profile);
      }
    }
  } catch (err) {
    console.error("Diagnostic script exception:", err);
  }
}

runDiagnostics();
