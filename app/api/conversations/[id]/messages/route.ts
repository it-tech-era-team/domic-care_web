import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;

    const supabase = createServerSupabaseClient();
    
    // Verify user belongs to this conversation
    const { data: conv } = await supabase
      .from("conversations")
      .select("user_id, caregiver_id")
      .eq("id", conversationId)
      .single();

    if (!conv || (conv.user_id !== user.id && conv.caregiver_id !== user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark unread messages sent by peer as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("read", false);

    const { data: messagesData, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[GET /api/conversations/[id]/messages] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages = (messagesData || []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      message: m.message,
      read: m.read,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[GET /api/conversations/[id]/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const body = await req.json().catch(() => ({}));
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Verify user belongs to this conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("user_id, caregiver_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conv || (conv.user_id !== user.id && conv.caregiver_id !== user.id)) {
      if (convError) console.error("[POST /api/conversations/[id]/messages] Conversation Lookup Error:", convError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Insert message
    const { data: msg, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        message,
        read: false,
      })
      .select()
      .single();

    if (msgError) {
      console.error("[POST /api/conversations/[id]/messages] Message Insert Error:", msgError);
      return NextResponse.json({ error: msgError.message }, { status: 400 });
    }

    // 3. Send Notification to receiver
    const recipientId = user.id === conv.user_id ? conv.caregiver_id : conv.user_id;
    await supabase.from("notifications").insert({
      user_id: recipientId,
      title: "New Chat Message",
      message: `You received a message from ${user.fullName}: "${message.slice(0, 40)}${message.length > 40 ? "..." : ""}"`,
      type: "chat_message",
      is_read: false,
    });

    const formattedMessage = {
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      message: msg.message,
      read: msg.read,
      createdAt: msg.created_at,
    };

    return NextResponse.json({ message: formattedMessage });
  } catch (err) {
    console.error("[POST /api/conversations/[id]/messages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
