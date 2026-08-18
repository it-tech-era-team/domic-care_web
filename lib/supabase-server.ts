import { createClient } from "@supabase/supabase-js";
import dns from "node:dns";

// Force Node.js to prefer IPv4 over IPv6 to prevent UND_ERR_CONNECT_TIMEOUT when accessed over local network
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

/**
 * Server-only Supabase client.
 * Uses the SERVICE ROLE key so it can bypass RLS and verify credentials.
 * NEVER import this file in client components.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
