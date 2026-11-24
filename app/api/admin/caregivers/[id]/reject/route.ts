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
    const body = await req.json().catch(() => ({}));
    const reason = (body.reason || "").trim();

    const supabase = createServerSupabaseClient();

    // 1. Fetch caregiver details
    const { data: cg, error: fetchError } = await supabase
      .from("caregiver_profiles")
      .select("id")
      .eq("id", caregiverId)
      .maybeSingle();

    if (fetchError || !cg) {
      return apiError("NOT_FOUND", "Caregiver profile not found.", 404, fetchError);
    }

    // 2. Reject caregiver profile
    const { error: profileError } = await supabase
      .from("caregiver_profiles")
      .update({
        approval_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", caregiverId);

    if (profileError) {
      return apiError("UPDATE_FAILED", "Failed to update profile rejection status.", 500, profileError);
    }

    // 3. Mark documents rejected
    await supabase
      .from("caregiver_documents")
      .update({ status: "rejected" })
      .eq("caregiver_id", caregiverId);

    // 4. Log admin action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: reason ? `Rejected Caregiver Verification: ${reason}` : "Rejected Caregiver Verification",
      target_id: caregiverId,
    });

    // 5. Send notification to caregiver with custom reason
    const rejectionMessage = reason
      ? `Your caregiver application was not approved for the following reason: "${reason}". Please review your documents and resubmit.`
      : "Your caregiver application was not approved. Please verify your credentials, update your bio, and resubmit.";

    await supabase.from("notifications").insert({
      user_id: caregiverId,
      title: "Application Needs Revision",
      message: rejectionMessage,
      type: "approval_update",
      is_read: false,
    });

    return apiSuccess({
      message: "Caregiver application rejected.",
      status: "rejected",
      reason: reason || null,
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Error rejecting caregiver application.", 500, err);
  }
}
