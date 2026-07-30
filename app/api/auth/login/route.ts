import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { setAuthCookies } from "@/lib/supabase-auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabaseServer = createServerSupabaseClient();
    
    // Retrieve the profile from the database to check bcrypt password_hash
    const { data: profile, error: profileErr } = await supabaseServer
      .from("profiles")
      .select("id, role, full_name, password_hash, phone, avatar_url")
      .eq("email", email)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password against stored password_hash
    const isMatch = await bcrypt.compare(password, profile.password_hash || "");
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json({ error: error?.message || "Invalid credentials" }, { status: 401 });
    }

    const role = profile?.role || data.user.user_metadata?.role || "user";
    const fullName = profile?.full_name || data.user.user_metadata?.full_name || email.split("@")[0];

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

    // Set secure HTTP-only auth cookies (token, refresh_token, user_role)
    setAuthCookies(
      response,
      data.session.access_token,
      data.session.refresh_token,
      role,
      data.session.expires_in
    );

    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
