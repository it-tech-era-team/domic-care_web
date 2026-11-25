import { NextRequest, NextResponse } from "next/server";
import { verifyRequestSessionDetails, verifyRequestSession, setAuthCookies, clearAuthCookies } from "@/lib/supabase-auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const result = await verifyRequestSessionDetails(req);
  if (!result.user) {
    const response = NextResponse.json({ user: null }, { status: 200 });
    clearAuthCookies(response);
    return response;
  }

  const response = NextResponse.json({ user: result.user }, { status: 200 });
  if (result.refreshedTokens) {
    setAuthCookies(
      response,
      result.refreshedTokens.accessToken,
      result.refreshedTokens.refreshToken,
      result.refreshedTokens.role,
      result.refreshedTokens.expiresIn
    );
  }
  return response;
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { fullName, email, phone, avatarUrl, password } = body;

    // Reject email modification attempts
    if (email !== undefined && email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Email address cannot be changed." }, { status: 400 });
    }

    if (fullName !== undefined && !fullName.trim()) {
      return NextResponse.json({ error: "Full name is strictly required." }, { status: 400 });
    }

    if (phone !== undefined && !phone.trim()) {
      return NextResponse.json({ error: "Phone number is strictly required." }, { status: 400 });
    }

    if (avatarUrl !== undefined && !avatarUrl.trim()) {
      return NextResponse.json({ error: "Profile avatar is strictly required." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Prepare updates for profiles table
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (fullName !== undefined) updates.full_name = fullName.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl.trim();

    // Update password in Auth and password_hash in profiles if provided
    if (password && password.trim().length > 0) {
      const { error: passError } = await supabase.auth.admin.updateUserById(user.id, {
        password: password,
      });
      if (passError) {
        console.error("[PATCH /api/auth/me] Supabase Auth password update error:", passError);
        return NextResponse.json({ error: passError.message }, { status: 400 });
      }
      updates.password_hash = await bcrypt.hash(password, 10);
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
