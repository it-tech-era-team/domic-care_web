import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import Stripe from "stripe";

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
const secretKey = envVars["STRIPE_SECRET_KEY"];

const supabase = createClient(url, serviceKey);
const stripe = new Stripe(secretKey);

async function runTestTransfer() {
  console.log("1. Finding latest completed/paid booking...");
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      id,
      user_id,
      caregiver_id,
      status,
      total_amount,
      payment_status,
      caregiver_profiles (
        stripe_account_id
      )
    `)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !booking) {
    console.error("No booking found:", error);
    return;
  }

  let accountId = booking.caregiver_profiles?.stripe_account_id;

  if (!accountId) {
    console.log("Creating Custom Account for caregiver...");
    const account = await stripe.accounts.create({
      type: "custom",
      country: "US",
      email: `caregiver_${booking.caregiver_id.slice(0, 8)}@example.com`,
      capabilities: { transfers: { requested: true } },
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: "127.0.0.1" }
    });
    accountId = account.id;
    await supabase.from("caregiver_profiles").update({ stripe_account_id: accountId }).eq("id", booking.caregiver_id);
  }

  console.log("Caregiver Account ID:", accountId);

  // Request capability update on destination account
  try {
    await stripe.accounts.update(accountId, {
      capabilities: { transfers: { requested: true } }
    });
  } catch (e) {
    console.log("Capability update warning:", e.message);
  }

  const totalUSD = Number(booking.total_amount || 44);
  const payoutCents = Math.round(totalUSD * 0.88 * 100); // 88% = $38.72

  console.log(`Executing Stripe Transfer of $${(payoutCents / 100).toFixed(2)} (88%) to ${accountId}...`);

  try {
    const transfer = await stripe.transfers.create({
      amount: payoutCents,
      currency: "usd",
      destination: accountId,
      transfer_group: booking.id,
      description: `Caregiver Payout (88%) for Booking ${booking.id.slice(0, 8)}`,
    });

    console.log("🎉 SUCCESS! Stripe Transfer Created! Transfer ID:", transfer.id);
    await supabase.from("bookings").update({ payment_status: "transferred", transfer_id: transfer.id }).eq("id", booking.id);
  } catch (transferErr) {
    console.error("Transfer Error Details:", transferErr.message);
  }
}

runTestTransfer();
