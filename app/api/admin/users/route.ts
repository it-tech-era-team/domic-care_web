import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createServerSupabaseClient();

    // Fetch all user role profiles (families/clients)
    const { data: usersData, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        avatar_url,
        role,
        account_status,
        is_deleted,
        created_at,
        updated_at,
        bookings!user_id (
          id,
          status,
          start_date,
          end_date,
          notes,
          created_at,
          services (
            id,
            name
          ),
          caregiver_profiles (
            id,
            profiles (
              full_name,
              avatar_url
            )
          )
        ),
        reviews!user_id (
          id,
          rating,
          comment,
          created_at,
          caregiver_profiles (
            id,
            profiles (
              full_name
            )
          )
        )
      `)
      .eq("role", "user")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/users] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedUsers = (usersData || []).map((u: any) => {
      const bookings = (u.bookings || []).map((b: any) => {
        const servObj = Array.isArray(b.services) ? b.services[0] : b.services;
        const cgProfObj = Array.isArray(b.caregiver_profiles) ? b.caregiver_profiles[0] : b.caregiver_profiles;
        const cgName = cgProfObj?.profiles?.full_name || "Caregiver";
        const cgAvatar = cgProfObj?.profiles?.avatar_url || "";

        return {
          id: b.id,
          status: b.status,
          startDate: b.start_date,
          endDate: b.end_date,
          notes: b.notes || "",
          serviceName: servObj?.name || "Care Service",
          caregiverName: cgName,
          caregiverAvatar: cgAvatar,
          createdAt: b.created_at,
        };
      });

      const reviews = (u.reviews || []).map((r: any) => {
        const cgProfObj = Array.isArray(r.caregiver_profiles) ? r.caregiver_profiles[0] : r.caregiver_profiles;
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment || "",
          caregiverName: cgProfObj?.profiles?.full_name || "Caregiver",
          createdAt: r.created_at,
        };
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter((b: any) => b.status === "completed").length;
      const cancelledBookings = bookings.filter((b: any) => b.status === "cancelled").length;
      const activeBookings = bookings.filter((b: any) => b.status === "accepted").length;
      const pendingBookings = bookings.filter((b: any) => b.status === "pending").length;

      return {
        id: u.id,
        fullName: u.full_name || "User",
        email: u.email || "",
        phone: u.phone || "Not Provided",
        avatarUrl: u.avatar_url || "",
        role: u.role,
        accountStatus: u.account_status || "active",
        isDeleted: u.is_deleted || false,
        joinedAt: u.created_at,

        totalBookings,
        completedBookings,
        cancelledBookings,
        activeBookings,
        pendingBookings,

        bookings,
        reviews,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");

    if (!id || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    if (action === "suspend") {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "suspended", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (action === "reactivate") {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: "active", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Account deleted by Admin";

    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_deleted: true,
        account_status: "deleted",
        deleted_at: new Date().toISOString(),
        deleted_reason: reason,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
