import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return apiError("VALIDATION_ERROR", "Please provide a valid email address.", 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${origin}/reset-password`;

    const supabaseServer = createServerSupabaseClient();

    // 1. Fetch user profile to get full name
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    // 2. Generate secure recovery link using Supabase Admin (replaces Supabase default SMTP email)
    const { data: linkData, error: linkError } = await supabaseServer.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: {
        redirectTo,
      },
    });

    const resetUrl = linkData?.properties?.action_link || `${origin}/reset-password`;

    // 3. Dispatch branded DomicCare password reset email via Nodemailer
    await sendPasswordResetEmail({
      to: cleanEmail,
      fullName: profile?.full_name || "User",
      resetUrl,
    });

    return apiSuccess({
      message: "If an account exists with this email, a password reset link has been dispatched.",
    });
  } catch (err: any) {
    console.error("[POST /api/auth/forgot-password] Error:", err);
    return apiError("INTERNAL_ERROR", "Unable to send password reset email.", 500, err);
  }
}
