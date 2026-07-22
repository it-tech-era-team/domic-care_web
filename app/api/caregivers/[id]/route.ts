import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // 1. Fetch caregiver details
    const { data: cg, error: cgError } = await supabase
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
        profiles (
          full_name,
          avatar_url
        ),
        caregiver_services (
          services (
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
        )
      `)
      .eq("id", id)
      .single();

    if (cgError || !cg) {
      if (cgError) console.error(`[GET /api/caregivers/${id}] Supabase Error:`, cgError);
      return NextResponse.json({ error: "Caregiver not found" }, { status: 404 });
    }

    // 2. Fetch caregiver reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles (
          full_name
        )
      `)
      .eq("caregiver_id", id);

    if (reviewsError) {
      console.error(`[GET /api/caregivers/${id}] Reviews Error:`, reviewsError);
    }

    // Format services
    const services = cg.caregiver_services?.map((cs: any) => cs.services?.name).filter(Boolean) || [];
    
    // Format availability
    const availability: any = {};
    cg.caregiver_availability?.forEach((av: any) => {
      availability[av.day_of_week] = {
        start: av.start_time?.slice(0, 5) || "09:00",
        end: av.end_time?.slice(0, 5) || "17:00",
        isAvailable: av.is_available,
      };
    });

    // Format documents
    const documents = cg.caregiver_documents?.map((doc: any) => ({
      id: doc.id,
      type: doc.document_type,
      fileUrl: doc.file_url,
      status: doc.status,
      uploaded_at: doc.uploaded_at,
    })) || [];

    // Format reviews
    const reviews = (reviewsData || []).map((r: any) => {
      const profileObj = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      return {
        id: r.id,
        userFullName: profileObj?.full_name || "Client",
        rating: r.rating || 5,
        comment: r.comment || "",
        date: r.created_at?.split("T")[0] || "",
      };
    });

    const reviewsCount = reviews.length;
    const rating = reviewsCount > 0
      ? parseFloat((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1))
      : 5.0;

    const profileObj = Array.isArray(cg.profiles) ? cg.profiles[0] : cg.profiles;

    const caregiver = {
      id: cg.id,
      fullName: profileObj?.full_name || "",
      avatarUrl: profileObj?.avatar_url || "",
      bio: cg.bio || "",
      experienceYears: cg.experience_years || 0,
      hourlyRate: parseFloat(cg.hourly_rate) || 0,
      gender: cg.gender || "Not Specified",
      dob: cg.date_of_birth || "",
      address: cg.address || "",
      city: cg.city || "",
      latitude: cg.latitude || 0,
      longitude: cg.longitude || 0,
      approvalStatus: cg.approval_status,
      services,
      rating,
      reviewsCount,
      availability,
      documents,
    };

    return NextResponse.json({ caregiver, reviews });
  } catch (err) {
    console.error("[GET /api/caregivers/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
