import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { sendWelcomeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, password, role } = await req.json().catch(() => ({}));
    if (!fullName || !email || !password || !role) {
      return apiError("VALIDATION_ERROR", "Full name, email, password, and role are required.", 400);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://domiccare.com";
    const emailRedirectTo = `${origin}/login?confirmed=true`;

    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          full_name: fullName,
          role: role,
          avatar_url: avatarUrl,
        },
      },
    });

    if (error || !data.user) {
      return apiError("AUTH_SIGNUP_FAILED", error?.message || "Signup failed.", 400, error);
    }

    const supabaseServer = createServerSupabaseClient();
    
    // Hash password and store in profiles table for compatibility
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await supabaseServer
      .from("profiles")
      .update({ phone, password_hash: passwordHash, full_name: fullName, role, avatar_url: avatarUrl })
      .eq("id", data.user.id);

    // If caregiver, insert default caregiver profile shell
    if (role === "caregiver") {
      const { error: caregiverError } = await supabaseServer
        .from("caregiver_profiles")
        .upsert({
          id: data.user.id,
          bio: "",
          experience_years: 0,
          hourly_rate: 25.00,
          approval_status: "pending",
        });
        
      if (caregiverError) {
        console.error("Error creating caregiver profile shell:", caregiverError);
      }
    }

    // Trigger branded DomicCare Welcome Email via Nodemailer (non-blocking)
    sendWelcomeEmail({
      to: email,
      fullName,
      roleTitle: role === "caregiver" ? "Caregiver" : "Family Member",
      loginUrl: `${origin}/login`,
    }).catch((emailErr) => console.error("[Signup] Welcome email send error:", emailErr));

    return apiSuccess({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName,
        role,
        requiresEmailConfirmation: !data.session,
      },
      message: data.session
        ? "Account created successfully."
        : "Account created. Please check your email to confirm your registration before signing in.",
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "An unexpected error occurred during signup.", 500, err);
  }
}
