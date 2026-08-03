import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: caregiversData, error } = await supabase
      .from("caregiver_profiles")
      .select(`
        id,
        bio,
        experience_years,
        hourly_rate,
        city,
        profiles (
          full_name,
          avatar_url
        ),
        caregiver_services (
          services (
            name
          )
        ),
        reviews (
          rating
        )
      `)
      .eq("approval_status", "approved")
      .limit(20);

    if (error) {
      console.error("[GET /api/caregivers/featured] Supabase Error:", error);
      return NextResponse.json({ caregivers: [] }, { status: 200 });
    }

    const formatted = (caregiversData || []).map((cg: any) => {
      const profileObj = Array.isArray(cg.profiles) ? cg.profiles[0] : cg.profiles;
      const services: string[] =
        cg.caregiver_services?.map((cs: any) => cs.services?.name).filter(Boolean) || [];
      const reviews: { rating: number }[] = cg.reviews || [];
      const reviewsCount = reviews.length;
      const rating =
        reviewsCount > 0
          ? parseFloat(
              (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsCount).toFixed(1)
            )
          : 5.0;

      return {
        id: cg.id,
        fullName: profileObj?.full_name || "DomicCare Professional",
        avatarUrl: profileObj?.avatar_url || "",
        bio: cg.bio || "",
        experienceYears: cg.experience_years || 0,
        hourlyRate: parseFloat(cg.hourly_rate) || 0,
        city: cg.city || "",
        services,
        rating,
        reviewsCount,
      };
    });

    // Sort by rating descending, take top 6
    const top = formatted.sort((a, b) => b.rating - a.rating).slice(0, 6);

    const res = NextResponse.json({ caregivers: top });
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (err) {
    console.error("[GET /api/caregivers/featured]", err);
    return NextResponse.json({ caregivers: [] }, { status: 200 });
  }
}
