import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

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
    const { status } = body;

    const validStatuses = ["pending", "accepted", "rejected", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
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
        services (
          name
        ),
        caregiver_profiles (
          profiles (
            full_name
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

    // 2. Validate permissions:
    // - Caregivers can accept/reject/complete bookings assigned to them.
    // - Clients (users) can cancel their own bookings.
    // - Admins can update any booking.
    const isCaregiver = user.id === booking.caregiver_id;
    const isClient = user.id === booking.user_id;
    const isAdmin = user.role === "admin";

    if (!isAdmin && !isCaregiver && !isClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isClient && status !== "cancelled") {
      return NextResponse.json({ error: "Clients can only cancel bookings" }, { status: 403 });
    }

    // 3. Update the booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("[PATCH /api/bookings/[id]] Update Error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 4. Create Notification alerts
    const b = booking as any;
    const serviceName = (Array.isArray(b.services) ? b.services[0]?.name : b.services?.name) || "Care";
    const dateOnly = b.start_date.split("T")[0];

    if (isCaregiver || isAdmin) {
      // Notify client (user)
      const cgProf = Array.isArray(b.caregiver_profiles) ? b.caregiver_profiles[0] : b.caregiver_profiles;
      const cgProfSub = cgProf ? (Array.isArray(cgProf.profiles) ? cgProf.profiles[0] : cgProf.profiles) : null;
      const caregiverName = cgProfSub?.full_name || "Caregiver";
      await supabase.from("notifications").insert({
        user_id: b.user_id,
        title: `Booking ${status.toUpperCase()}`,
        message: `${caregiverName} has marked your ${serviceName} booking for ${dateOnly} as ${status}.`,
        type: "booking_update",
        is_read: false,
      });
    } else if (isClient) {
      // Notify caregiver
      const userProf = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      const clientName = userProf?.full_name || "Client";
      await supabase.from("notifications").insert({
        user_id: b.caregiver_id,
        title: "Booking Cancelled",
        message: `${clientName} has cancelled their ${serviceName} booking request for ${dateOnly}.`,
        type: "booking_update",
        is_read: false,
      });
    }

    // 5. If booking is accepted, automatically activate/create conversation and post welcome message
    if (status === "accepted") {
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
            message: `Booking Confirmed! 🎉 Your ${serviceName} care session for ${dateOnly} is accepted. You can now chat directly here for schedule details and care instructions.`,
            read: false,
          });
        }
      } catch (convErr) {
        console.error("[PATCH /api/bookings/[id]] Conversation Auto-Create Error:", convErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
