import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return apiError("VALIDATION_ERROR", "A valid email address is required.", 400);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://domiccare.com";
    const emailRedirectTo = `${origin}/login?confirmed=true`;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      return apiError("RESEND_FAILED", error.message || "Failed to resend confirmation email.", 400, error);
    }

    return apiSuccess({
      message: "A new confirmation email has been dispatched. Please check your inbox and spam folders.",
    });
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Unable to process confirmation email resend request.", 500, err);
  }
}
