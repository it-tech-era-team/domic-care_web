import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://domiccare.com";
    const redirectTo = `${origin}/api/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error || !data.url) {
      return apiError("OAUTH_INIT_FAILED", error?.message || "Failed to initialize Google OAuth.", 400, error);
    }

    const wantsJson = req.headers.get("accept")?.includes("application/json");
    if (wantsJson) {
      return apiSuccess({ url: data.url });
    }

    return NextResponse.redirect(data.url);
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Error initiating Google authentication.", 500, err);
  }
}
