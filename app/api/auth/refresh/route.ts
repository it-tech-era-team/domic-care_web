import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { setAuthCookies, clearAuthCookies } from "@/lib/supabase-auth";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      clearAuthCookies(res);
      return res;
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      const res = NextResponse.json({ user: null }, { status: 200 });
      clearAuthCookies(res);
      return res;
    }

    // Get user profile role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, phone, avatar_url")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role || data.user.user_metadata?.role || "user";
    const fullName = profile?.full_name || data.user.user_metadata?.full_name || "";

    const response = NextResponse.json({
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName,
        role,
        phone: profile?.phone || "",
        avatarUrl: profile?.avatar_url || "",
      },
    });

    setAuthCookies(
      response,
      data.session.access_token,
      data.session.refresh_token,
      role,
      data.session.expires_in
    );

    return response;
  } catch (err) {
    console.error("[POST /api/auth/refresh]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
