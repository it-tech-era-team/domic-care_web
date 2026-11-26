import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || (user.role !== "user" && user.role !== "caregiver")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await req.json().catch(() => ({}));
    const { rating, comment } = body;

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Verify booking exists and belongs to this user/caregiver
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, caregiver_id, user_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      if (fetchError) console.error("[POST /api/bookings/[id]/review] Fetch Error:", fetchError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Role-based access validation
    if (user.role === "user" && booking.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You cannot review this booking" }, { status: 403 });
    }
    if (user.role === "caregiver" && booking.caregiver_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You are not the caregiver for this booking" }, { status: 403 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Reviews can only be submitted for completed care bookings." }, { status: 400 });
    }

    // 2. Check if review already exists for this role
    let existingReview = null;
    const { data: roleReview, error: checkError } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("reviewer_role", user.role)
      .maybeSingle();

    if (!checkError && roleReview) {
      existingReview = roleReview;
    } else if (checkError && checkError.message?.includes("reviewer_role")) {
      // Fallback if reviewer_role column not yet in DB
      const { data: singleReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("booking_id", bookingId)
        .maybeSingle();
      existingReview = singleReview;
    }

    if (existingReview) {
      return NextResponse.json({ error: "You have already submitted a review for this booking." }, { status: 400 });
    }

    // 3. Insert the review (with reviewer_role)
    const reviewData: any = {
      booking_id: bookingId,
      user_id: booking.user_id,
      caregiver_id: booking.caregiver_id,
      rating: parsedRating,
      comment: comment || "",
      reviewer_role: user.role,
    };

    let { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    // Fallback if reviewer_role column doesn't exist yet
    if (reviewError && reviewError.message?.includes("reviewer_role")) {
      delete reviewData.reviewer_role;
      const res = await supabase.from("reviews").insert(reviewData).select().single();
      review = res.data;
      reviewError = res.error;
    }

    if (reviewError) {
      console.error("[POST /api/bookings/[id]/review] Review Insert Error:", reviewError);
      return NextResponse.json({ error: reviewError.message }, { status: 400 });
    }

    // 4. Send targeted notification
    const recipientId = user.role === "user" ? booking.caregiver_id : booking.user_id;
    const notifTitle = user.role === "user" ? "New Review Received" : "Caregiver Feedback Received";
    const notifMessage = user.role === "user"
      ? `${user.fullName} submitted a ${parsedRating}-star rating for your care service.`
      : `${user.fullName} submitted a ${parsedRating}-star rating and feedback for your care session.`;

    await supabase.from("notifications").insert({
      user_id: recipientId,
      title: notifTitle,
      message: notifMessage,
      type: "booking_update",
      is_read: false,
    });

    return NextResponse.json({ review });
  } catch (err) {
    console.error("[POST /api/bookings/[id]/review]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
