import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "user") {
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

    // 1. Verify booking exists and belongs to this user
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("id, caregiver_id, user_id, status")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      if (fetchError) console.error("[POST /api/bookings/[id]/review] Fetch Error:", fetchError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You cannot review this booking" }, { status: 403 });
    }

    // 2. Insert the review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        caregiver_id: booking.caregiver_id,
        rating: parsedRating,
        comment: comment || "",
      })
      .select()
      .single();

    if (reviewError) {
      console.error("[POST /api/bookings/[id]/review] Review Insert Error:", reviewError);
      return NextResponse.json({ error: reviewError.message }, { status: 400 });
    }

    return NextResponse.json({ review });
  } catch (err) {
    console.error("[POST /api/bookings/[id]/review]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
