import { NextRequest, NextResponse } from "next/server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const user = await verifyRequestSession(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, email, phone, avatarUrl } = body;

    const supabase = createServerSupabaseClient();

    // Prepare updates for profiles table
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (fullName !== undefined) updates.full_name = fullName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    // Update email in Auth if it has changed
    if (email && email !== user.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
        email: email,
        email_confirm: true,
      });
      if (authError) {
        console.error("[PATCH /api/auth/me] Supabase Auth update error:", authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    // Update profiles table
    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (profileError) {
      console.error("[PATCH /api/auth/me] Supabase DB update error:", profileError);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        role: updatedProfile.role,
        fullName: updatedProfile.full_name,
        phone: updatedProfile.phone || "",
        avatarUrl: updatedProfile.avatar_url || "",
      }
    });
  } catch (err) {
    console.error("[PATCH /api/auth/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
