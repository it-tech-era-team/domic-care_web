import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: caregiverId } = await params;

    const supabase = createServerSupabaseClient();

    // 1. Fetch caregiver details
    const { data: cg, error: fetchError } = await supabase
      .from("caregiver_profiles")
      .select("id, profiles ( full_name )")
      .eq("id", caregiverId)
      .single();

    if (fetchError || !cg) {
      if (fetchError) console.error("[POST /api/admin/caregivers/[id]/approve] Fetch Error:", fetchError);
      return NextResponse.json({ error: "Caregiver not found" }, { status: 404 });
    }

    // 2. Approve caregiver profile
    const { error: profileError } = await supabase
      .from("caregiver_profiles")
      .update({ approval_status: "approved" })
      .eq("id", caregiverId);

    if (profileError) {
      console.error("[POST /api/admin/caregivers/[id]/approve] Profile Update Error:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    // 3. Approve caregiver documents
    await supabase
      .from("caregiver_documents")
      .update({ status: "approved" })
      .eq("caregiver_id", caregiverId);

    // 4. Log admin action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "Approved Caregiver Profile",
      target_id: caregiverId,
    });

    // 5. Send notification to caregiver
    await supabase.from("notifications").insert({
      user_id: caregiverId,
      title: "Profile Approved",
      message: "Your Domic Care caregiver profile has been approved! You are now live in search results.",
      type: "approval_update",
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/caregivers/[id]/approve]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
