import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import { stripe, calculateBookingSplit } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Only client users can create payment intents" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Fetch booking & caregiver hourly rate / service info
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        user_id,
        caregiver_id,
        status,
        start_date,
        end_date,
        total_amount,
        payment_intent_id,
        caregiver_profiles (
          hourly_rate
        ),
        services (
          name
        )
      `)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("[POST /api/stripe/create-payment-intent] Booking fetch error:", fetchError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this booking" }, { status: 403 });
    }

    if (booking.status !== "awaiting_payment" && booking.status !== "pending") {
      return NextResponse.json({ error: `Cannot pay for booking with status: ${booking.status}` }, { status: 400 });
    }

    // 2. Determine price (if total_amount not yet calculated, compute based on duration & rate)
    let totalUSD = Number(booking.total_amount || 0);
    if (totalUSD <= 0) {
      const cgProf = Array.isArray(booking.caregiver_profiles)
        ? booking.caregiver_profiles[0]
        : booking.caregiver_profiles;
      const hourlyRate = Number(cgProf?.hourly_rate || 25);

      const start = new Date(booking.start_date).getTime();
      const end = new Date(booking.end_date).getTime();
      const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));

      totalUSD = hours * hourlyRate;
    }

    const split = calculateBookingSplit(totalUSD);

    // 3. Create or reuse Stripe Payment Intent
    let clientSecret = "";
    let paymentIntentId = booking.payment_intent_id;

    if (paymentIntentId) {
      try {
        const existingPI = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (existingPI && existingPI.status !== "canceled") {
          clientSecret = existingPI.client_secret || "";
        }
      } catch (e) {
        console.warn("[Stripe] Existing PI retrieve failed, creating new one:", e);
      }
    }

    if (!clientSecret) {
      const b = booking as any;
      const serviceName = (Array.isArray(b.services) ? b.services[0]?.name : b.services?.name) || "Care Service";
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: split.totalCents,
        currency: "usd",
        payment_method_types: ["card"],
        description: `Domicare Booking: ${serviceName} (${booking.id.slice(0, 8)})`,
        metadata: {
          booking_id: booking.id,
          user_id: user.id,
          caregiver_id: booking.caregiver_id,
          platform_fee_cents: split.platformFeeCents,
          caregiver_payout_cents: split.caregiverPayoutCents,
        },
      });

      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret || "";
    }

    // 4. Update booking record in Supabase with payment calculation details
    await supabase
      .from("bookings")
      .update({
        payment_intent_id: paymentIntentId,
        total_amount: split.totalAmountUSD,
        platform_fee: split.platformFeeUSD,
        caregiver_payout: split.caregiverPayoutUSD,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      totalAmountUSD: split.totalAmountUSD,
      platformFeeUSD: split.platformFeeUSD,
      caregiverPayoutUSD: split.caregiverPayoutUSD,
    });
  } catch (err) {
    console.error("[POST /api/stripe/create-payment-intent]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
