import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { id: caregiverId } = await params;
    const supabase = createServerSupabaseClient();

    // 1. Fetch caregiver details
    const { data: cg, error: fetchError } = await supabase
      .from("caregiver_profiles")
      .select("id, profiles ( full_name )")
      .eq("id", caregiverId)
      .maybeSingle();

    if (fetchError || !cg) {
      return apiError("NOT_FOUND", "Caregiver profile not found.", 404, fetchError);
    }

    // 2. Approve caregiver profile
    const { error: profileError } = await supabase
      .from("caregiver_profiles")
      .update({
        approval_status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", caregiverId);

    if (profileError) {
      return apiError("UPDATE_FAILED", "Failed to approve caregiver profile.", 500, profileError);
    }

    // 3. Approve caregiver documents
    await supabase
      .from("caregiver_documents")
      .update({ status: "approved" })
      .eq("caregiver_id", caregiverId);

    // 4. Log admin action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "Approved Caregiver Verification Application",
      target_id: caregiverId,
    });

    // 5. Send notification to caregiver
    await supabase.from("notifications").insert({
      user_id: caregiverId,
      title: "Profile Approved",
      message: "Congratulations! Your DomicCare caregiver profile and credentials have been verified and approved. You are now visible to clients.",
      type: "approval_update",
      is_read: false,
    });

    return apiSuccess({
      message: "Caregiver approved successfully.",
      status: "approved",
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Error approving caregiver.", 500, err);
  }
}
