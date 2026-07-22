import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Manually parse .env.local to avoid requiring external packages
const envFile = fs.readFileSync(".env.local", "utf8");
const envVars = {};
envFile.split("\n").forEach((line) => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join("=").trim();
  }
});

const url = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const key = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

console.log("Supabase URL:", url);
console.log("Supabase Key Length:", key ? key.length : 0);

const supabase = createClient(url, key);

async function testSignup() {
  const email = `test_${Math.floor(Math.random() * 100000)}@example.com`;
  const password = "password123";

  console.log("Attempting sign up for:", email);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: "Test Tester",
          role: "user",
        },
      },
    });

    if (error) {
      console.error("Supabase Error Details:", JSON.stringify(error, null, 2));
    } else {
      console.log("Signup Succeeded! User ID:", data.user?.id);
    }
  } catch (err) {
    console.error("Network Fetch Exception:", err);
  }
}

testSignup();
