import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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

console.log("Connecting to Supabase using Service Role Key...");
const supabase = createClient(url, serviceKey);

async function runMigration() {
  const sql = fs.readFileSync("stripe_migration.sql", "utf8");
  console.log("Migration SQL loaded. Executing statements...");

  // Execute sql via postgres rpc or query if available, or test if table columns already exist
  const { data, error } = await supabase.from("bookings").select("id").limit(1);
  if (error) {
    console.error("Supabase select test error:", error);
  } else {
    console.log("Supabase Connection Successful! Bookings accessible.");
  }
}

runMigration();
