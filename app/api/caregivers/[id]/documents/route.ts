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

    const { id: caregiverId } = await params;

    const supabase = createServerSupabaseClient();
    const { data: documents, error } = await supabase
      .from("caregiver_documents")
      .select("*")
      .eq("caregiver_id", caregiverId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("[GET /api/caregivers/[id]/documents] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents });
  } catch (err) {
    console.error("[GET /api/caregivers/[id]/documents]", err);
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

    const { id: caregiverId } = await params;

    // Check if caregiver is uploading for their own account
    if (user.role !== "admin" && user.id !== caregiverId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { type, fileUrl } = body;

    if (!type || !fileUrl) {
      return NextResponse.json({ error: "Document type and file URL are required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("caregiver_documents")
      .insert({
        caregiver_id: caregiverId,
        document_type: type,
        file_url: fileUrl,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/caregivers/[id]/documents] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    console.error("[POST /api/caregivers/[id]/documents]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
