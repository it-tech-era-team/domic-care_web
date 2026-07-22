import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

// Haversine formula to calculate distance in km
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    const isAdmin = user?.role === "admin";

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const service = searchParams.get("service") || "All";
    const maxRate = searchParams.get("maxRate") ? parseFloat(searchParams.get("maxRate")!) : null;
    const minExperience = searchParams.get("minExperience") ? parseInt(searchParams.get("minExperience")!) : null;
    const maxDistance = searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : null;
    const day = searchParams.get("day") || "All";
    const userLat = searchParams.get("userLat") ? parseFloat(searchParams.get("userLat")!) : null;
    const userLng = searchParams.get("userLng") ? parseFloat(searchParams.get("userLng")!) : null;

    const supabase = createServerSupabaseClient();

    let query = supabase
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
        ),
        reviews (
          rating
        )
      `);

    // If not admin, only show approved caregivers
    if (!isAdmin) {
      query = query.eq("approval_status", "approved");
    }

    const { data: caregiversData, error } = await query;

    if (error) {
      console.error("[GET /api/caregivers] Supabase Error:", error);
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
        uploaded_at: doc.uploaded_at,
      })) || [];

      const reviews = cg.reviews || [];
      const reviewsCount = reviews.length;
      const rating = reviewsCount > 0
        ? parseFloat((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1))
        : 5.0;

      const profileObj = Array.isArray(cg.profiles) ? cg.profiles[0] : cg.profiles;
      
      // Calculate distance if coordinates are provided
      let distance = 0;
      if (userLat !== null && userLng !== null) {
        distance = parseFloat(calculateHaversineDistance(userLat, userLng, cg.latitude || 0, cg.longitude || 0).toFixed(1));
      }

      return {
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
        distance,
      };
    });

    // Apply filtering
    let filtered = formattedCaregivers;
    
    // Note: We only filter if at least one filter param is applied or if user lat/lng is given for distance sorting
    filtered = formattedCaregivers.filter((cg) => {
      // Search text matching
      if (search) {
        const query = search.toLowerCase();
        const matchesQuery =
          cg.fullName.toLowerCase().includes(query) ||
          cg.bio.toLowerCase().includes(query) ||
          cg.address.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // Service matching
      if (service !== "All") {
        const matchesService = cg.services.some((s: string) => s.toLowerCase() === service.toLowerCase());
        if (!matchesService) return false;
      }

      // Hourly rate matching
      if (maxRate !== null) {
        if (cg.hourlyRate > maxRate) return false;
      }

      // Experience matching
      if (minExperience !== null) {
        if (cg.experienceYears < minExperience) return false;
      }

      // Distance matching
      if (maxDistance !== null && userLat !== null && userLng !== null) {
        if (cg.distance > maxDistance) return false;
      }

      // Availability matching
      if (day !== "All") {
        const isAvail = cg.availability[day] && cg.availability[day].isAvailable;
        if (!isAvail) return false;
      }

      return true;
    });

    // Sort by distance if user location is provided
    if (userLat !== null && userLng !== null) {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json({ caregivers: filtered });
  } catch (err) {
    console.error("[GET /api/caregivers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
