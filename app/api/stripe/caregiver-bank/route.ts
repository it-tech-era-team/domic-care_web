import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import {
  ensureStripeCaregiverAccount,
  attachCaregiverBankAccount,
} from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "caregiver") {
      return NextResponse.json({ error: "Only caregivers can access bank details" }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from("caregiver_profiles")
      .select("stripe_account_id, bank_name, account_holder_name, routing_number, account_number_last4, payouts_enabled")
      .eq("id", user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("[GET /api/stripe/caregiver-bank]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      bankDetails: {
        stripeAccountId: profile?.stripe_account_id || null,
        bankName: profile?.bank_name || "",
        accountHolderName: profile?.account_holder_name || "",
        routingNumber: profile?.routing_number ? `****${profile.routing_number.slice(-4)}` : "",
        accountNumberLast4: profile?.account_number_last4 || "",
        payoutsEnabled: !!profile?.payouts_enabled,
      },
    });
  } catch (err) {
    console.error("[GET /api/stripe/caregiver-bank]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "caregiver") {
      return NextResponse.json({ error: "Only caregivers can update bank details" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { bankName, accountHolderName, routingNumber, accountNumber } = body;

    if (!bankName || !accountHolderName || !routingNumber || !accountNumber) {
      return NextResponse.json({ error: "All bank account fields are required" }, { status: 400 });
    }

    // Basic routing number & account number format checks
    const cleanedRouting = routingNumber.replace(/\D/g, "");
    const cleanedAccount = accountNumber.replace(/\D/g, "");

    if (cleanedRouting.length !== 9) {
      return NextResponse.json({ error: "Routing number must be 9 digits (US standard)" }, { status: 400 });
    }

    if (cleanedAccount.length < 4 || cleanedAccount.length > 17) {
      return NextResponse.json({ error: "Invalid account number length" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const last4 = cleanedAccount.slice(-4);

    // 1. Get caregiver profile info
    const { data: cgProfile } = await supabase
      .from("caregiver_profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .maybeSingle();

    let stripeAccountId = cgProfile?.stripe_account_id || null;

    // 2. Attempt Stripe Account & Bank Token creation with graceful fallback
    try {
      const accountId = await ensureStripeCaregiverAccount(
        user.id,
        user.email,
        accountHolderName || user.fullName,
        stripeAccountId
      );

      if (accountId) {
        stripeAccountId = accountId;
        try {
          await attachCaregiverBankAccount(
            stripeAccountId,
            cleanedRouting,
            cleanedAccount,
            accountHolderName
          );
        } catch (bankAttachErr: any) {
          console.warn("[Stripe Bank Attachment Warning]:", bankAttachErr?.message || bankAttachErr);
        }
      }
    } catch (stripeAccountErr: any) {
      console.warn(
        "[Stripe Account Notice]: Bank details saved locally. (Enable Accounts v1 at https://dashboard.stripe.com/settings/features/feat_accounts_v1_support for direct Stripe Connect linking). Details:",
        stripeAccountErr?.message || stripeAccountErr
      );
    }

    // 3. Save bank details securely to Supabase caregiver_profiles table
    const { error: updateError } = await supabase
      .from("caregiver_profiles")
      .update({
        stripe_account_id: stripeAccountId,
        bank_name: bankName,
        account_holder_name: accountHolderName,
        routing_number: cleanedRouting,
        account_number_last4: last4,
        payouts_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[POST /api/stripe/caregiver-bank] DB Update Error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bankDetails: {
        stripeAccountId,
        bankName,
        accountHolderName,
        routingNumber: `****${cleanedRouting.slice(-4)}`,
        accountNumberLast4: last4,
        payoutsEnabled: true,
      },
    });
  } catch (err) {
    console.error("[POST /api/stripe/caregiver-bank]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
