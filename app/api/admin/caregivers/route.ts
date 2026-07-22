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
    const { data: caregiversData, error } = await supabase
      .from("caregiver_profiles")
      .select(`
        id,
        bio,
        experience_years,
        hourly_rate,
        gender,
        date_of_birth,
        address,
        city,
        latitude,
        longitude,
        approval_status,
        created_at,
        profiles (
          full_name,
          email,
          phone,
          avatar_url,
          account_status,
          is_deleted,
          created_at
        ),
        caregiver_services (
          services (
            id,
            name
          )
        ),
        caregiver_availability (
          day_of_week,
          start_time,
          end_time,
          is_available
        ),
        caregiver_documents (
          id,
          document_type,
          file_url,
          status,
          uploaded_at
        ),
        reviews (
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        ),
        bookings (
          id,
          status,
          start_date,
          end_date,
          notes,
          created_at,
          services (
            id,
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/caregivers] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedCaregivers = (caregiversData || []).map((cg: any) => {
      const profileObj = Array.isArray(cg.profiles) ? cg.profiles[0] : cg.profiles;

      const services = cg.caregiver_services?.map((cs: any) => cs.services?.name).filter(Boolean) || [];
      
      const availability: any = {};
      cg.caregiver_availability?.forEach((av: any) => {
        availability[av.day_of_week] = {
          start: av.start_time?.slice(0, 5) || "09:00",
          end: av.end_time?.slice(0, 5) || "17:00",
          isAvailable: av.is_available,
        };
      });

      const documents = (cg.caregiver_documents || []).map((doc: any) => ({
        id: doc.id,
        type: doc.document_type,
        fileUrl: doc.file_url,
        url: doc.file_url,
        status: doc.status,
        uploaded_at: doc.uploaded_at,
      }));

      const reviews = (cg.reviews || []).map((r: any) => {
        const revProf = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment || "",
          created_at: r.created_at,
          profiles: revProf ? {
            full_name: revProf.full_name || "Anonymous Family",
            avatar_url: revProf.avatar_url || "",
          } : undefined,
        };
      });

      const reviewsCount = reviews.length;
      const ratingSum = reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
      const averageRating = reviewsCount > 0
        ? parseFloat((ratingSum / reviewsCount).toFixed(1))
        : 5.0;

      const bookings = (cg.bookings || []).map((b: any) => {
        const servObj = Array.isArray(b.services) ? b.services[0] : b.services;
        return {
          id: b.id,
          status: b.status,
          start_date: b.start_date,
          end_date: b.end_date,
          notes: b.notes,
          services: servObj ? { id: servObj.id, name: servObj.name } : undefined,
        };
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter((b: any) => b.status === "completed").length;
      const cancelledBookings = bookings.filter((b: any) => b.status === "cancelled").length;
      const pendingBookings = bookings.filter((b: any) => b.status === "pending").length;
      const acceptedBookings = bookings.filter((b: any) => b.status === "accepted").length;

      const joinedAt = profileObj?.created_at || cg.created_at || new Date().toISOString();

      return {
        id: cg.id,
        fullName: profileObj?.full_name || "",
        email: profileObj?.email || "",
        phone: profileObj?.phone || "",
        avatarUrl: profileObj?.avatar_url || "",
        bio: cg.bio || "",
        gender: cg.gender || "Not Specified",
        dob: cg.date_of_birth || "",
        address: cg.address || "",
        city: cg.city || "",
        latitude: cg.latitude || 0,
        longitude: cg.longitude || 0,
        hourlyRate: parseFloat(cg.hourly_rate) || 0,
        experienceYears: cg.experience_years || 0,
        approvalStatus: cg.approval_status || "pending",
        accountStatus: profileObj?.account_status || "active",
        isDeleted: profileObj?.is_deleted || false,
        joinedAt,

        rating: averageRating,
        reviewsCount,
        averageRating,
        totalReviews: reviewsCount,

        totalBookings,
        completedBookings,
        cancelledBookings,
        pendingBookings,
        acceptedBookings,

        services,
        availability,
        documents,
        reviews,
        bookings,
      };
    });

    return NextResponse.json({ caregivers: formattedCaregivers });
  } catch (err) {
    console.error("[GET /api/admin/caregivers]", err);
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
      return NextResponse.json({ error: "Caregiver ID and action are required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    if (action === "approve") {
      const { error } = await supabase
        .from("caregiver_profiles")
        .update({ approval_status: "approved", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      await supabase.from("notifications").insert({
        user_id: id,
        title: "Account Approved",
        message: "Your caregiver application has been verified and approved. You are now live on Domic Care!",
        type: "approval_update",
      });
    } else if (action === "reject") {
      const { error } = await supabase
        .from("caregiver_profiles")
        .update({ approval_status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      await supabase.from("notifications").insert({
        user_id: id,
        title: "Verification Update",
        message: "Your caregiver application requires revisions. Please review your profile documents.",
        type: "approval_update",
      });
    } else if (action === "suspend") {
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
    console.error("[PATCH /api/admin/caregivers]", err);
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
      return NextResponse.json({ error: "Caregiver ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Deleted by Admin";

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
    console.error("[DELETE /api/admin/caregivers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
