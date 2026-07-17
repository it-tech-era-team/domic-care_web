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
    const { data: logsData, error } = await supabase
      .from("admin_logs")
      .select(`
        id,
        admin_id,
        action,
        target_id,
        created_at,
        profiles (
          full_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/logs] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const logs = (logsData || []).map((l: any) => ({
      id: l.id,
      adminId: l.admin_id,
      adminName: l.profiles?.full_name || "Admin",
      action: l.action,
      targetId: l.target_id || "",
      targetName: "", // Can be filled in on the UI or set as empty
      createdAt: l.created_at,
    }));

    return NextResponse.json({ adminLogs: logs });
  } catch (err) {
    console.error("[GET /api/admin/logs]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
