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

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function inspectDatabase() {
  console.log("--- Inspecting Database Schema and Tables ---");

  // 1. Check services
  const { data: services, error: servicesErr } = await supabase
    .from("services")
    .select("*");

  if (servicesErr) {
    console.error("Error reading 'services' table:", servicesErr);
  } else {
    console.log("Successfully read 'services' table. Row count:", services.length);
    console.log("Services list:", services);
  }

  // 2. Check profiles
  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("*");

  if (profilesErr) {
    console.error("Error reading 'profiles' table:", profilesErr);
  } else {
    console.log("Successfully read 'profiles' table. Row count:", profiles.length);
    console.log("Profiles sample:", profiles.slice(0, 5));
  }

  // 3. Check caregiver_profiles
  const { data: caregivers, error: caregiversErr } = await supabase
    .from("caregiver_profiles")
    .select("*");

  if (caregiversErr) {
    console.error("Error reading 'caregiver_profiles' table:", caregiversErr);
  } else {
    console.log("Successfully read 'caregiver_profiles' table. Row count:", caregivers.length);
  }
}

inspectDatabase();
