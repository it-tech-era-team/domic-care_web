import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[GET /api/services] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ services });
  } catch (err) {
    console.error("[GET /api/services]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, description } = await req.json().catch(() => ({}));
    if (!name) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .insert({ name, description })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/services] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log admin action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: `Added Service Type: ${name}`,
      target_id: data.id,
    });

    return NextResponse.json({ service: data });
  } catch (err) {
    console.error("[POST /api/services]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // Fetch service info first for logging
    const { data: service } = await supabase
      .from("services")
      .select("name")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[DELETE /api/services] Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Log admin action
    if (service) {
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: `Deleted Service Type: ${service.name}`,
        target_id: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/services]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
