import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    const { password, email, token } = await req.json().catch(() => ({}));

    if (!password || password.length < 6) {
      return apiError("VALIDATION_ERROR", "Password must be at least 6 characters long.", 400);
    }

    const supabaseServer = createServerSupabaseClient();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (user?.id) {
      // Authenticated reset (e.g. from recovery session)
      await supabaseServer.auth.admin.updateUserById(user.id, { password });
      await supabaseServer.from("profiles").update({ password_hash: passwordHash }).eq("id", user.id);
      return apiSuccess({ message: "Password updated successfully." });
    }

    if (email) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (profile?.id) {
        await supabaseServer.auth.admin.updateUserById(profile.id, { password });
        await supabaseServer.from("profiles").update({ password_hash: passwordHash }).eq("id", profile.id);
        return apiSuccess({ message: "Password updated successfully." });
      }
    }

    return apiError("UNAUTHORIZED", "Valid reset session or account reference required.", 401);
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Password reset failed.", 500, err);
  }
}
