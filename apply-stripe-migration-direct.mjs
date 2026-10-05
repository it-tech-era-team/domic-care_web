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

const supabase = createClient(url, serviceKey);

async function runDirectMigration() {
  console.log("Applying schema alterations to Supabase...");
  
  // We can call pg_net or execute sql via rpc if available, or test reading/writing columns
  const migrationQueries = [
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00;`,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10, 2) DEFAULT 0.00;`,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS caregiver_payout DECIMAL(10, 2) DEFAULT 0.00;`,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;`,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';`,
    `ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS transfer_id TEXT;`,
    `ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;`,
    `ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS bank_name TEXT;`,
    `ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS account_holder_name TEXT;`,
    `ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS routing_number TEXT;`,
    `ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS account_number_last4 TEXT;`,
    `ALTER TABLE public.caregiver_profiles ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN DEFAULT false;`
  ];

  for (const q of migrationQueries) {
    try {
      // Execute query via supabase rpc or rest sql if available
      const { error } = await supabase.rpc('exec_sql', { sql: q });
      if (error) {
        // Fallback: try raw query or ignore if rpc doesn't exist
        console.log(`RPC query execution note for (${q}):`, error.message);
      } else {
        console.log("Executed query successfully:", q);
      }
    } catch (e) {
      console.log("Error running query:", e);
    }
  }
}

runDirectMigration();
