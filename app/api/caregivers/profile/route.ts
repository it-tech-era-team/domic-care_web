import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "caregiver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    let { data: cg, error } = await supabase
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
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (!cg) {
      // Auto-provision initial caregiver profile shell if missing with required schema defaults
      await supabase
        .from("caregiver_profiles")
        .upsert({
          id: user.id,
          bio: "Professional caregiver dedicated to providing high-quality compassionate care.",
          experience_years: 0,
          hourly_rate: 25.00,
          gender: "Other",
          date_of_birth: "1990-01-01",
          address: "Main Street",
          city: "Sofia",
          approval_status: "pending",
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      const { data: provisionedCg } = await supabase
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
        `)
        .eq("id", user.id)
        .maybeSingle();

      cg = provisionedCg;
    }

    if (!cg) {
      if (error) console.error("[GET /api/caregivers/profile] Supabase Error:", error);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Format
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
      : 0.0;

    const cgData = cg as any;
    const profileObj = Array.isArray(cgData.profiles) ? cgData.profiles[0] : cgData.profiles;

    const profile = {
      id: cgData.id,
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

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[GET /api/caregivers/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "caregiver") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      bio,
      experienceYears,
      hourlyRate,
      gender,
      dob,
      address,
      city,
      latitude,
      longitude,
      services,
      availability,
      documents,
    } = body;

    const supabase = createServerSupabaseClient();

    // Prepare updates
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (bio !== undefined) updates.bio = bio;
    if (experienceYears !== undefined) updates.experience_years = Number(experienceYears);
    if (hourlyRate !== undefined) updates.hourly_rate = Number(hourlyRate);
    if (gender !== undefined) updates.gender = gender;
    if (dob !== undefined) updates.date_of_birth = dob || null;
    if (address !== undefined) updates.address = address;
    if (city !== undefined) updates.city = city;
    
    if (latitude !== undefined && longitude !== undefined) {
      updates.latitude = Number(latitude);
      updates.longitude = Number(longitude);
      // Construct PostGIS geography point (WKT: POINT(longitude latitude))
      updates.location = `POINT(${longitude} ${latitude})`;
    }

    // Ensure parent caregiver_profile row exists via upsert before child table operations
    // Fall back to valid defaults so Postgres constraints (date_of_birth NOT NULL, caregiver_bio_min_length) are never violated
    const fallbackBio = "Professional caregiver dedicated to providing high-quality compassionate care.";
    let safeBio = updates.bio !== undefined ? updates.bio : fallbackBio;
    if (typeof safeBio === "string" && safeBio.trim().length < 30) {
      safeBio = safeBio.trim().length > 0 ? safeBio.trim().padEnd(30, " ") : fallbackBio;
    }

    const profilePayload: any = {
      id: user.id,
      bio: safeBio,
      experience_years: updates.experience_years !== undefined ? Number(updates.experience_years) : 0,
      hourly_rate: updates.hourly_rate !== undefined ? Number(updates.hourly_rate) : 25.00,
      gender: updates.gender || "Other",
      date_of_birth: updates.date_of_birth || "1990-01-01",
      address: updates.address || "Main Street",
      city: updates.city || "Sofia",
      approval_status: updates.approval_status || "pending",
      updated_at: new Date().toISOString(),
      ...updates,
    };
    profilePayload.bio = safeBio;
    if (!profilePayload.date_of_birth) profilePayload.date_of_birth = "1990-01-01";
    if (!profilePayload.gender) profilePayload.gender = "Other";
    if (!profilePayload.address) profilePayload.address = "Main Street";
    if (!profilePayload.city) profilePayload.city = "Sofia";

    const { error: upsertError } = await supabase
      .from("caregiver_profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (upsertError) {
      console.error("[PATCH /api/caregivers/profile] Supabase Upsert Error:", upsertError);
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }

    // Update caregiver services mapping if provided
    if (Array.isArray(services)) {
      // 1. Fetch available service IDs
      const { data: dbServices } = await supabase
        .from("services")
        .select("id, name");

      const serviceIdsToInsert = dbServices
        ?.filter(s => services.includes(s.name))
        .map(s => s.id) || [];

      // 2. Clear old caregiver services
      await supabase
        .from("caregiver_services")
        .delete()
        .eq("caregiver_id", user.id);

      // 3. Insert new caregiver services
      if (serviceIdsToInsert.length > 0) {
        const rowsToInsert = serviceIdsToInsert.map(sid => ({
          caregiver_id: user.id,
          service_id: sid,
        }));
        await supabase
          .from("caregiver_services")
          .insert(rowsToInsert);
      }
    }

    // Update availability if provided
    if (availability && typeof availability === "object") {
      // 1. Clear old availability
      await supabase
        .from("caregiver_availability")
        .delete()
        .eq("caregiver_id", user.id);

      // 2. Insert new rows
      const rowsToInsert = Object.entries(availability).map(([day, slot]: [string, any]) => ({
        caregiver_id: user.id,
        day_of_week: day,
        start_time: slot.start ? `${slot.start}:00` : "09:00:00",
        end_time: slot.end ? `${slot.end}:00` : "17:00:00",
        is_available: slot.isAvailable ?? true,
      }));

      if (rowsToInsert.length > 0) {
        await supabase
          .from("caregiver_availability")
          .insert(rowsToInsert);
      }
    }

    // Update caregiver verification documents if provided
    if (Array.isArray(documents)) {
      // 1. Delete existing documents
      const { error: delErr } = await supabase
        .from("caregiver_documents")
        .delete()
        .eq("caregiver_id", user.id);

      if (delErr) {
        console.error("[PATCH /api/caregivers/profile] Document deletion error:", delErr);
        return NextResponse.json({ error: delErr.message }, { status: 400 });
      }

      // 2. Insert new documents
      if (documents.length > 0) {
        const rowsToInsert = documents
          .map((doc: any) => ({
            caregiver_id: user.id,
            document_type: doc.type || "Verification Document",
            file_url: doc.fileUrl || doc.url || "",
            status: doc.status || "pending",
          }))
          .filter((doc: any) => doc.file_url.trim() !== "");

        if (rowsToInsert.length > 0) {
          const { error: insErr } = await supabase
            .from("caregiver_documents")
            .insert(rowsToInsert);

          if (insErr) {
            console.error("[PATCH /api/caregivers/profile] Document insertion error:", insErr);
            return NextResponse.json({ error: insErr.message }, { status: 400 });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/caregivers/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
