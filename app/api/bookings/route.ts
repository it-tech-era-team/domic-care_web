import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/auth-guard";
import { apiSuccess, apiError } from "@/lib/api-response";
import { calculatePricing, formatCurrency } from "@/lib/currency";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const supabase = createServerSupabaseClient();
    let query = supabase
      .from("bookings")
      .select(`
        id,
        user_id,
        caregiver_id,
        service_id,
        start_date,
        end_date,
        location,
        status,
        notes,
        total_amount,
        platform_fee,
        caregiver_payout,
        payment_status,
        payment_intent_id,
        transfer_id,
        created_at,
        profiles (
          full_name,
          avatar_url
        ),
        caregiver_profiles (
          hourly_rate,
          profiles (
            full_name,
            avatar_url
          )
        ),
        services (
          name
        ),
        reviews (
          *
        )
      `);

    // Filters based on role
    if (user.role === "caregiver") {
      query = query.eq("caregiver_id", user.id);
    } else if (user.role === "user") {
      query = query.eq("user_id", user.id);
    } // Admin gets all bookings

    const { data: bookingsData, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return apiError("DATABASE_ERROR", "Failed to retrieve bookings list.", 500, error);
    }

    const formattedBookings = (bookingsData || []).map((b: any) => {
      const revList: any[] = Array.isArray(b.reviews) ? b.reviews : (b.reviews ? [b.reviews] : []);
      const userReview = revList.find(r => r.reviewer_role === 'user') || 
        (revList.length > 0 && (!revList[0].reviewer_role || revList[0].reviewer_role === 'user') ? revList[0] : null);
      const caregiverReview = revList.find(r => r.reviewer_role === 'caregiver') || null;
      const cgProf = Array.isArray(b.caregiver_profiles) ? b.caregiver_profiles[0] : b.caregiver_profiles;

      return {
        id: b.id,
        userId: b.user_id,
        userFullName: b.profiles?.full_name || "",
        userAvatar: b.profiles?.avatar_url || "",
        caregiverId: b.caregiver_id,
        caregiverFullName: cgProf?.profiles?.full_name || "",
        caregiverAvatar: cgProf?.profiles?.avatar_url || "",
        serviceId: b.service_id,
        serviceName: b.services?.name || "General Care",
        startDate: b.start_date,
        endDate: b.end_date,
        status: b.status,
        location: b.location || "Location not provided",
        notes: b.notes || "",
        totalAmount: b.total_amount ? Number(b.total_amount) : 0,
        platformFee: b.platform_fee ? Number(b.platform_fee) : 0,
        caregiverPayout: b.caregiver_payout ? Number(b.caregiver_payout) : 0,
        currency: "USD",
        formattedTotal: formatCurrency(b.total_amount ? Number(b.total_amount) : 0),
        paymentStatus: b.payment_status || "unpaid",
        paymentIntentId: b.payment_intent_id || null,
        transferId: b.transfer_id || null,
        createdAt: b.created_at,
        rating: userReview?.rating ?? null,
        comment: userReview?.comment ?? null,
        clientRating: userReview?.rating ?? null,
        clientComment: userReview?.comment ?? null,
        caregiverRating: caregiverReview?.rating ?? null,
        caregiverComment: caregiverReview?.comment ?? null,
      };
    });

    // Provide both envelope and top-level key for backward compatibility with app
    return NextResponse.json({
      success: true,
      bookings: formattedBookings,
      data: { bookings: formattedBookings },
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Unable to process bookings request.", 500, err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await requireAuth(req, ["user"]);
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => ({}));
    const { caregiverId, serviceName, startDate, endDate, location, notes, totalAmount, platformFee, caregiverPayout } = body;

    if (!caregiverId || !serviceName || !startDate || !endDate || !location) {
      return apiError("VALIDATION_ERROR", "Please fill in all required appointment fields (caregiver, service, date, time, address).", 400);
    }

    const supabase = createServerSupabaseClient();

    // 1. Fetch service ID with case-insensitive search and fallback
    let matchedService: { id: string; name: string } | null = null;
    const { data: serviceExact } = await supabase
      .from("services")
      .select("id, name")
      .ilike("name", serviceName.trim())
      .maybeSingle();

    if (serviceExact) {
      matchedService = serviceExact;
    } else {
      // Fallback: look for partial match or first service
      const { data: fallbackServices } = await supabase.from("services").select("id, name").limit(1);
      matchedService = fallbackServices?.[0] || null;
    }

    if (!matchedService) {
      return apiError("SERVICE_NOT_FOUND", "The requested service category could not be resolved.", 400);
    }

    // 2. Lookup caregiver rate to calculate accurate total in EUR
    const { data: cgProfile } = await supabase
      .from("caregiver_profiles")
      .select("hourly_rate")
      .eq("id", caregiverId)
      .maybeSingle();

    const hourlyRate = Number(cgProfile?.hourly_rate || 25);
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const hours = Math.max(0.5, (endMs - startMs) / (1000 * 60 * 60));

    const pricing = calculatePricing(hours, hourlyRate);
    const finalTotalAmount = Number(totalAmount || pricing.totalAmount);
    const finalPlatformFee = Number(platformFee || pricing.platformFee);
    const finalCaregiverPayout = Number(caregiverPayout || pricing.caregiverPayout);

    // 3. Insert booking
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        caregiver_id: caregiverId,
        service_id: matchedService.id,
        start_date: startDate,
        end_date: endDate,
        location: location.trim(),
        status: "pending",
        total_amount: finalTotalAmount,
        platform_fee: finalPlatformFee,
        caregiver_payout: finalCaregiverPayout,
        payment_status: "unpaid",
        notes: notes || "",
      })
      .select()
      .single();

    if (insertError) {
      return apiError("BOOKING_INSERT_FAILED", "Failed to record booking request. Please check your details.", 400, insertError);
    }

    // 4. Create Notification for the caregiver with EUR currency
    const dateOnly = startDate.split("T")[0];
    await supabase.from("notifications").insert({
      user_id: caregiverId,
      title: "New Booking Request",
      message: `You received a new request for ${matchedService.name} (${formatCurrency(finalTotalAmount)}) from ${user.fullName} on ${dateOnly}.`,
      type: "booking_request",
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      booking,
      data: { booking },
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "An unexpected error occurred while submitting booking request.", 500, err);
  }
}
