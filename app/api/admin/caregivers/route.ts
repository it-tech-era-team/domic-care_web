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
          status
        ),
        reviews (
          rating
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/caregivers] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedCaregivers = (caregiversData || []).map((cg: any) => {
      const services = cg.caregiver_services?.map((cs: any) => cs.services?.name).filter(Boolean) || [];
      
      const availability: any = {};
      cg.caregiver_availability?.forEach((av: any) => {
        availability[av.day_of_week] = {
          start: av.start_time?.slice(0, 5) || "09:00",
          end: av.end_time?.slice(0, 5) || "17:00",
          isAvailable: av.is_available,
        };
      });

      const documents = cg.caregiver_documents?.map((doc: any) => ({
        id: doc.id,
        type: doc.document_type,
        fileUrl: doc.file_url,
        status: doc.status,
      })) || [];

      const reviews = cg.reviews || [];
      const reviewsCount = reviews.length;
      const rating = reviewsCount > 0
        ? parseFloat((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : 5.0;

      return {
        id: cg.id,
        fullName: cg.profiles?.full_name || "",
        avatarUrl: cg.profiles?.avatar_url || "",
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
    });

    return NextResponse.json({ caregivers: formattedCaregivers });
  } catch (err) {
    console.error("[GET /api/admin/caregivers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
