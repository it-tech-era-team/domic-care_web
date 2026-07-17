import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        status,
        notes,
        created_at,
        profiles (
          full_name
        ),
        caregiver_profiles (
          profiles (
            full_name,
            avatar_url
          )
        ),
        services (
          name
        ),
        reviews (
          rating,
          comment
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
      console.error("[GET /api/bookings] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedBookings = (bookingsData || []).map((b: any) => {
      // Reviews might return as an array or object
      const reviewObj = Array.isArray(b.reviews) ? b.reviews[0] : b.reviews;

      return {
        id: b.id,
        userId: b.user_id,
        userFullName: b.profiles?.full_name || "",
        caregiverId: b.caregiver_id,
        caregiverFullName: b.caregiver_profiles?.profiles?.full_name || "",
        caregiverAvatar: b.caregiver_profiles?.profiles?.avatar_url || "",
        serviceId: b.service_id,
        serviceName: b.services?.name || "",
        startDate: b.start_date,
        endDate: b.end_date,
        status: b.status,
        notes: b.notes || "",
        createdAt: b.created_at,
        rating: reviewObj?.rating,
        comment: reviewObj?.comment,
      };
    });

    return NextResponse.json({ bookings: formattedBookings });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Only clients can request bookings" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { caregiverId, serviceName, startDate, endDate, notes } = body;

    if (!caregiverId || !serviceName || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Fetch service ID
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("name", serviceName)
      .single();

    if (serviceError || !service) {
      if (serviceError) console.error("[POST /api/bookings] Service Lookup Error:", serviceError);
      return NextResponse.json({ error: "Service type not found" }, { status: 400 });
    }

    // 2. Insert booking
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        caregiver_id: caregiverId,
        service_id: service.id,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
        notes,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[POST /api/bookings] Insert Error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // 3. Create Notification for the caregiver
    const dateOnly = startDate.split("T")[0];
    await supabase.from("notifications").insert({
      user_id: caregiverId,
      title: "New Booking Request",
      message: `You received a new request for ${serviceName} from ${user.fullName} on ${dateOnly}.`,
      type: "booking_request",
      is_read: false,
    });

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("[POST /api/bookings]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
