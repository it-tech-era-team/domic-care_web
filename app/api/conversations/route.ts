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

    const conversations = [];
    for (const conv of (conversationsData || [])) {
      // Fetch latest message
      const { data: msg } = await supabase
        .from("messages")
        .select("message, created_at, sender_id, read")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch unread count for current user
      const { count: unreadCount } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("read", false)
        .neq("sender_id", user.id);

      // Fetch active booking context
      const { data: activeBooking } = await supabase
        .from("bookings")
        .select(`
          status,
          start_date,
          services ( name )
        `)
        .eq("user_id", conv.user_id)
        .eq("caregiver_id", conv.caregiver_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const c = conv as any;
      const clientProfileObj = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      const caregiverProfileObj = Array.isArray(c.caregiver_profiles) ? c.caregiver_profiles[0] : c.caregiver_profiles;
      const caregiverSubProfileObj = caregiverProfileObj ? (Array.isArray(caregiverProfileObj.profiles) ? caregiverProfileObj.profiles[0] : caregiverProfileObj.profiles) : null;

      const bkServ = activeBooking as any;
      const serviceName = (Array.isArray(bkServ?.services) ? bkServ?.services[0]?.name : bkServ?.services?.name) || "Care Service";

      conversations.push({
        id: c.id,
        userId: c.user_id,
        userFullName: clientProfileObj?.full_name || "Client",
        userAvatar: clientProfileObj?.avatar_url || "",
        caregiverId: c.caregiver_id,
        caregiverFullName: caregiverSubProfileObj?.full_name || "Caregiver",
        caregiverAvatar: caregiverSubProfileObj?.avatar_url || "",
        lastMessage: msg?.message || "",
        unreadCount: unreadCount || 0,
        bookingStatus: bkServ?.status || null,
        bookingService: serviceName,
        bookingStartDate: bkServ?.start_date || null,
        updatedAt: msg?.created_at || c.created_at,
      });
    }

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
