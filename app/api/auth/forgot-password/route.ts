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

    // Dynamically detect origin based on incoming request host, avoiding unresolvable external fallbacks
    const reqOrigin = req.headers.get("origin");
    const headerHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const headerProto = req.headers.get("x-forwarded-proto") || (headerHost.includes("localhost") ? "http" : "https");
    
    let origin = "";
    if (reqOrigin && !reqOrigin.includes("undefined")) {
      origin = reqOrigin;
    } else if (headerHost) {
      origin = `${headerProto}://${headerHost}`;
    } else if (process.env.NEXT_PUBLIC_APP_URL) {
      origin = process.env.NEXT_PUBLIC_APP_URL;
    } else {
      origin = "http://localhost:3000";
    }
    origin = origin.replace(/\/+$/, "");
    const redirectTo = `${origin}/reset-password`;

    const supabaseServer = createServerSupabaseClient();

    // 1. Fetch user profile to get full name
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("full_name")
      .eq("email", cleanEmail)
      .maybeSingle();

    // 2. Generate secure recovery link using Supabase Admin
    const { data: linkData, error: linkError } = await supabaseServer.auth.admin.generateLink({
      type: "recovery",
      email: cleanEmail,
      options: {
        redirectTo,
      },
    });

    if (linkError || !linkData?.properties) {
      console.error("[generateLink error]:", linkError);
      return apiError("LINK_GENERATION_FAILED", "Unable to generate password reset token.", 500);
    }

    const hashedToken = linkData.properties.hashed_token;
    const expiresAt = Date.now() + 60 * 60 * 1000; // Valid for 1 hour

    // Construct direct reset URL targeting our website directly (bypasses supabase.co hosted redirects completely)
    let resetUrl = "";
    if (hashedToken) {
      resetUrl = `${origin}/reset-password?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&email=${encodeURIComponent(cleanEmail)}&exp=${expiresAt}`;
    } else {
      resetUrl = linkData?.properties?.action_link || `${origin}/reset-password`;
      if (!origin.includes("localhost") && resetUrl) {
        resetUrl = resetUrl
          .replaceAll("http%3A%2F%2Flocalhost%3A3000", encodeURIComponent(origin))
          .replaceAll("http://localhost:3000", origin)
          .replaceAll("http%3A%2F%2Flocalhost", encodeURIComponent(origin))
          .replaceAll("http://localhost", origin);
      }
      if (!resetUrl.includes("email=")) {
        const separator = resetUrl.includes("?") ? "&" : "?";
        resetUrl = `${resetUrl}${separator}email=${encodeURIComponent(cleanEmail)}`;
      }
    }

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
