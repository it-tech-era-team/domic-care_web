import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password, role } = await req.json().catch(() => ({}));
    if (!fullName || !email || !password || !role) {
      return NextResponse.json({ error: "Name, email, password, and role are required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    console.log("[DEBUG Signup] Supabase URL read at runtime:", url);
    console.log("[DEBUG Signup] Supabase key length:", key ? key.length : "undefined");

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(fullName)}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          avatar_url: avatarUrl,
        }
      }
    });

    if (error || !data.user) {
      console.error("[POST /api/auth/signup] Supabase Auth Error:", error);
      return NextResponse.json({ error: error?.message || "Signup failed" }, { status: 400 });
    }

    const supabaseServer = createServerSupabaseClient();
    
    // 1. Hash the password and update profiles table with phone number and password_hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await supabaseServer
      .from("profiles")
      .update({ phone, password_hash: passwordHash })
      .eq("id", data.user.id);

    // 2. If caregiver, insert empty caregiver profile row
    if (role === "caregiver") {
      const { error: caregiverError } = await supabaseServer
        .from("caregiver_profiles")
        .insert({
          id: data.user.id,
          bio: "",
          experience_years: 0,
          hourly_rate: 20.00,
          approval_status: "pending",
        });
        
      if (caregiverError) {
        console.error("Error creating caregiver profile shell:", caregiverError);
      }
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName,
        role,
      }
    });
  } catch (err) {
    console.error("[POST /api/auth/signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
