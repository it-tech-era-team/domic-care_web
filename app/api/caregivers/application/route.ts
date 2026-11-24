import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "caregiver") {
      return apiError("UNAUTHORIZED", "Only registered caregivers can submit applications.", 401);
    }

    const supabase = createServerSupabaseClient();

    // 1. Fetch current caregiver profile details
    const { data: profile, error: fetchError } = await supabase
      .from("caregiver_profiles")
      .select("approval_status, bio")
      .eq("id", user.id)
      .maybeSingle();

    if (fetchError) {
      return apiError("DATABASE_ERROR", "Failed to retrieve caregiver profile.", 500, fetchError);
    }

    // 2. Enforce minimum bio length requirement (Issue #12)
    const bioText = (profile?.bio || "").trim();
    if (bioText.length < 30) {
      return apiError(
        "BIO_TOO_SHORT",
        "A bio of at least 30 characters describing your experience and qualifications is required before submitting.",
        400
      );
    }

    // 3. Idempotency Check (Issue #13): If already pending, do not duplicate notifications
    if (profile?.approval_status === "pending") {
      return apiSuccess({
        status: "pending",
        message: "Your application is currently under review by our administration team.",
      });
    }

    // 4. Update status to pending
    const { error: updateError } = await supabase
      .from("caregiver_profiles")
      .update({
        approval_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return apiError("UPDATE_FAILED", "Failed to submit application.", 500, updateError);
    }

    // 5. Create exactly one notification for the caregiver
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Application Submitted",
      message: "Your caregiver application details have been submitted for verification.",
      type: "approval_update",
      is_read: false,
    });

    return apiSuccess({
      status: "pending",
      message: "Application submitted successfully for admin verification.",
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "An unexpected error occurred while submitting application.", 500, err);
  }
}
