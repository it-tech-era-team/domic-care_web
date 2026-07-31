import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ unreadNotifsCount: 0, unreadMessagesCount: 0 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Unread notifications count
    const { count: unreadNotifsCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    // 2. Unread messages count across all user's conversations
    // First get conversation IDs
    let convQuery = supabase
      .from("conversations")
      .select("id");

    if (user.role === "caregiver") {
      convQuery = convQuery.eq("caregiver_id", user.id);
    } else if (user.role === "user") {
      convQuery = convQuery.eq("user_id", user.id);
    }

    const { data: userConvs } = await convQuery;
    const convIds = (userConvs || []).map((c) => c.id);

    let unreadMessagesCount = 0;
    let latestMessageId: string | null = null;

    if (convIds.length > 0) {
      const { count: msgCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .eq("read", false)
        .neq("sender_id", user.id);
      
      unreadMessagesCount = msgCount || 0;

      // Query latest message ID across all user conversations to detect new incoming read/unread messages
      const { data: latestMsg } = await supabase
        .from("messages")
        .select("id")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestMsg) {
        latestMessageId = latestMsg.id;
      }
    }

    return NextResponse.json({
      unreadNotifsCount: unreadNotifsCount || 0,
      unreadMessagesCount: unreadMessagesCount || 0,
      latestMessageId: latestMessageId || null,
    });
  } catch (err) {
    console.error("[GET /api/sync/check]", err);
    return NextResponse.json({ unreadNotifsCount: 0, unreadMessagesCount: 0 });
  }
}
