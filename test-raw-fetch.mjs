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
const anonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const serviceKey = envVars["SUPABASE_SERVICE_ROLE_KEY"];

async function testFetch() {
  const targetUrl = `${url}/auth/v1/health`;
  console.log("Fetching:", targetUrl);

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`
      }
    });

    console.log("Response Status:", res.status);
    console.log("Response Status Text:", res.statusText);
    const body = await res.text();
    console.log("Response Body:", body);
  } catch (err) {
    console.error("Fetch caught error:", err);
  }
}

testFetch();
