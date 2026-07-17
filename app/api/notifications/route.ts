import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const { data: notificationsData, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/notifications] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const notifications = (notificationsData || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at,
    }));

    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
