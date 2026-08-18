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
    
    // Fetch conversations where user is client OR caregiver
    let query = supabase
      .from("conversations")
      .select(`
        id,
        user_id,
        caregiver_id,
        created_at,
        profiles (
          full_name,
          avatar_url
        ),
        caregiver_profiles (
          profiles (
            full_name,
            avatar_url
          )
        )
      `);

    if (user.role === "caregiver") {
      query = query.eq("caregiver_id", user.id);
    } else if (user.role === "user") {
      query = query.eq("user_id", user.id);
    }

    const { data: conversationsData, error } = await query;

    if (error) {
      console.error("[GET /api/conversations] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const convList = conversationsData || [];
    const convIds = convList.map((c: any) => c.id);

    // 1. Batch fetch latest messages across all user conversations
    const latestMsgByConv = new Map<string, any>();
    if (convIds.length > 0) {
      const { data: rawMsgs } = await supabase
        .from("messages")
        .select("conversation_id, message, created_at, sender_id, read")
        .in("conversation_id", convIds)
        .order("created_at", { ascending: false })
        .limit(convIds.length * 5);

      (rawMsgs || []).forEach((m: any) => {
        if (!latestMsgByConv.has(m.conversation_id)) {
          latestMsgByConv.set(m.conversation_id, m);
        }
      });
    }

    // 2. Batch fetch unread counts per conversation
    const unreadCountByConv = new Map<string, number>();
    if (convIds.length > 0) {
      const { data: unreadMsgs } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .eq("read", false)
        .neq("sender_id", user.id);

      (unreadMsgs || []).forEach((m: any) => {
        const count = unreadCountByConv.get(m.conversation_id) || 0;
        unreadCountByConv.set(m.conversation_id, count + 1);
      });
    }

    // 3. Batch fetch active bookings per user/caregiver pair
    const bookingByPair = new Map<string, any>();
    const userIds = Array.from(new Set(convList.map((c: any) => c.user_id)));
    const caregiverIds = Array.from(new Set(convList.map((c: any) => c.caregiver_id)));

    if (userIds.length > 0 && caregiverIds.length > 0) {
      const { data: activeBookings } = await supabase
        .from("bookings")
        .select(`
          user_id,
          caregiver_id,
          status,
          start_date,
          created_at,
          services ( name )
        `)
        .in("user_id", userIds)
        .in("caregiver_id", caregiverIds)
        .order("created_at", { ascending: false });

      (activeBookings || []).forEach((bk: any) => {
        const pairKey = `${bk.user_id}_${bk.caregiver_id}`;
        if (!bookingByPair.has(pairKey)) {
          bookingByPair.set(pairKey, bk);
        }
      });
    }

    // 4. Assemble formatted conversations in memory (O(N))
    const conversations = convList.map((conv: any) => {
      const msg = latestMsgByConv.get(conv.id);
      const unreadCount = unreadCountByConv.get(conv.id) || 0;
      const pairKey = `${conv.user_id}_${conv.caregiver_id}`;
      const activeBooking = bookingByPair.get(pairKey);

      const clientProfileObj = Array.isArray(conv.profiles) ? conv.profiles[0] : conv.profiles;
      const caregiverProfileObj = Array.isArray(conv.caregiver_profiles) ? conv.caregiver_profiles[0] : conv.caregiver_profiles;
      const caregiverSubProfileObj = caregiverProfileObj ? (Array.isArray(caregiverProfileObj.profiles) ? caregiverProfileObj.profiles[0] : caregiverProfileObj.profiles) : null;

      const bkServ = activeBooking as any;
      const serviceName = (Array.isArray(bkServ?.services) ? bkServ?.services[0]?.name : bkServ?.services?.name) || "Care Service";

      // If message is a base64 string before backfill script runs, truncate it
      let lastMsgText = msg?.message || "";
      if (lastMsgText.startsWith("data:image")) {
        lastMsgText = "📷 Photo attachment";
      }

      return {
        id: conv.id,
        userId: conv.user_id,
        userFullName: clientProfileObj?.full_name || "Client",
        userAvatar: clientProfileObj?.avatar_url || "",
        caregiverId: conv.caregiver_id,
        caregiverFullName: caregiverSubProfileObj?.full_name || "Caregiver",
        caregiverAvatar: caregiverSubProfileObj?.avatar_url || "",
        lastMessage: lastMsgText,
        unreadCount,
        bookingStatus: bkServ?.status || null,
        bookingService: serviceName,
        bookingStartDate: bkServ?.start_date || null,
        updatedAt: msg?.created_at || conv.created_at,
      };
    });

    // Sort by updatedAt descending
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[GET /api/conversations]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "user") {
      return NextResponse.json({ error: "Only users can initiate conversations" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { caregiverId } = body;

    if (!caregiverId) {
      return NextResponse.json({ error: "Caregiver ID is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Check if conversation already exists
    const { data: existing, error: checkError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("caregiver_id", caregiverId)
      .maybeSingle();

    if (checkError) {
      console.error("[POST /api/conversations] Check Conversation Exist Error:", checkError);
    }

    if (existing) {
      return NextResponse.json({ conversationId: existing.id });
    }

    // 2. Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        caregiver_id: caregiverId,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("[POST /api/conversations] Insert Error:", createError);
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    return NextResponse.json({ conversationId: newConv.id });
  } catch (err) {
    console.error("[POST /api/conversations]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
