import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import {
  transferPayoutToCaregiver,
  calculateBookingSplit,
  ensureStripeCaregiverAccount,
} from "@/lib/stripe";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, paymentStatus, paymentIntentId } = body;

    const validStatuses = ["pending", "awaiting_payment", "accepted", "rejected", "completed", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Fetch current booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        user_id,
        caregiver_id,
        status,
        start_date,
        total_amount,
        platform_fee,
        caregiver_payout,
        payment_status,
        payment_intent_id,
        transfer_id,
        services (
          name
        ),
        caregiver_profiles (
          id,
          stripe_account_id,
          payouts_enabled,
          profiles (
            full_name,
            email
          )
        ),
        profiles (
          full_name
        )
      `)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      if (fetchError) console.error("[PATCH /api/bookings/[id]] Fetch Error:", fetchError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const isCaregiver = user.id === booking.caregiver_id;
    const isClient = user.id === booking.user_id;
    const isAdmin = user.role === "admin";

    if (!isAdmin && !isCaregiver && !isClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine target status
    let targetStatus = status || booking.status;

    // Caregiver accepts -> set status to awaiting_payment so client can pay
    if (isCaregiver && status === "accepted" && booking.status === "pending") {
      targetStatus = "awaiting_payment";
    }

    const updatePayload: Record<string, any> = {
      status: targetStatus,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus) {
      updatePayload.payment_status = paymentStatus;
    }
    if (paymentIntentId) {
      updatePayload.payment_intent_id = paymentIntentId;
    }

    // 2. Handling Completion & Stripe Transfer (88% Caregiver Payout, 12% Platform Fee)
    if (targetStatus === "completed") {
      const cgProf = Array.isArray(booking.caregiver_profiles)
        ? booking.caregiver_profiles[0]
        : booking.caregiver_profiles;

      const cgUserProf = cgProf ? (Array.isArray(cgProf.profiles) ? cgProf.profiles[0] : cgProf.profiles) : null;
      let caregiverStripeAccountId = cgProf?.stripe_account_id;
      const totalAmountUSD = Number(booking.total_amount || 44);

      const split = calculateBookingSplit(totalAmountUSD > 0 ? totalAmountUSD : 44);

      updatePayload.total_amount = split.totalAmountUSD;
      updatePayload.platform_fee = split.platformFeeUSD;
      updatePayload.caregiver_payout = split.caregiverPayoutUSD;

      // Ensure caregiver has a Stripe Account ID
      if (!caregiverStripeAccountId) {
        caregiverStripeAccountId = await ensureStripeCaregiverAccount(
          booking.caregiver_id,
          cgUserProf?.email || "",
          cgUserProf?.full_name || "Caregiver"
        );

        if (caregiverStripeAccountId) {
          await supabase
            .from("caregiver_profiles")
            .update({
              stripe_account_id: caregiverStripeAccountId,
              payouts_enabled: true,
            })
            .eq("id", booking.caregiver_id);
        }
      }

      // Trigger Stripe transfer if account ID exists and not yet transferred
      if (caregiverStripeAccountId && booking.payment_status !== "transferred") {
        try {
          const transfer = await transferPayoutToCaregiver({
            caregiverStripeAccountId,
            paymentIntentId: booking.payment_intent_id || paymentIntentId,
            payoutAmountUSD: split.caregiverPayoutUSD,
            bookingId: booking.id,
          });

          updatePayload.payment_status = "transferred";
          updatePayload.transfer_id = transfer.id;
          console.log(`[Stripe Transfer SUCCESS] Transferred payout to ${caregiverStripeAccountId}. Transfer ID: ${transfer.id}`);
        } catch (stripeErr: any) {
          console.error("[Stripe Transfer Exception]:", stripeErr?.message || stripeErr);
          updatePayload.payment_status = "payout_pending";
        }
      }
    }

    // 3. Update DB
    const { error: updateError } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", bookingId);

    if (updateError) {
      console.error("[PATCH /api/bookings/[id]] Update Error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 4. Notifications & Auto-Conversation setup
    const b = booking as any;
    const serviceName = (Array.isArray(b.services) ? b.services[0]?.name : b.services?.name) || "Care";
    const dateOnly = b.start_date.split("T")[0];
    const cgProf = Array.isArray(b.caregiver_profiles) ? b.caregiver_profiles[0] : b.caregiver_profiles;
    const cgProfSub = cgProf ? (Array.isArray(cgProf.profiles) ? cgProf.profiles[0] : cgProf.profiles) : null;
    const caregiverName = cgProfSub?.full_name || "Caregiver";

    if (targetStatus === "awaiting_payment") {
      await supabase.from("notifications").insert({
        user_id: b.user_id,
        title: "Booking Request Accepted!",
        message: `${caregiverName} accepted your ${serviceName} booking for ${dateOnly}. Please complete payment to confirm.`,
        type: "booking_update",
        is_read: false,
      });
    } else if (targetStatus === "accepted" || paymentStatus === "paid") {
      // Create chat conversation when payment confirmed
      try {
        const { data: existingConv } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", b.user_id)
          .eq("caregiver_id", b.caregiver_id)
          .maybeSingle();

        let conversationId = existingConv?.id;

        if (!conversationId) {
          const { data: newConv } = await supabase
            .from("conversations")
            .insert({
              user_id: b.user_id,
              caregiver_id: b.caregiver_id,
            })
            .select("id")
            .single();

          conversationId = newConv?.id;
        }

        if (conversationId) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: b.caregiver_id,
            message: `Booking Paid & Confirmed! 🎉 Payment for ${serviceName} on ${dateOnly} is complete. You can chat here anytime!`,
            read: false,
          });
        }
      } catch (convErr) {
        console.error("[PATCH /api/bookings/[id]] Auto-Chat Error:", convErr);
      }
    }

    return NextResponse.json({
      success: true,
      bookingStatus: targetStatus,
      paymentStatus: updatePayload.payment_status || booking.payment_status,
      transferId: updatePayload.transfer_id || booking.transfer_id,
    });
  } catch (err) {
    console.error("[PATCH /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
