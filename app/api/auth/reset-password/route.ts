import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifyRequestSession } from "@/lib/supabase-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyRequestSession(req);
    const { password, email, token, token_hash } = await req.json().catch(() => ({}));

    if (!password || password.length < 6) {
      return apiError("VALIDATION_ERROR", "Password must be at least 6 characters long.", 400);
    }

    const supabaseServer = createServerSupabaseClient();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let targetUserId = user?.id;

    // Check bearer token in authorization header if session cookie was not present
    if (!targetUserId) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const bearerToken = authHeader.split(" ")[1];
        if (bearerToken) {
          const { data: userData } = await supabaseServer.auth.getUser(bearerToken);
          if (userData?.user?.id) {
            targetUserId = userData.user.id;
          }
        }
      }
    }

    // Check recovery token_hash if provided
    if (!targetUserId && (token_hash || token)) {
      try {
        const { data: verifyData } = await supabaseServer.auth.verifyOtp({
          token_hash: token_hash || token,
          type: "recovery",
        });
        if (verifyData?.user?.id) {
          targetUserId = verifyData.user.id;
        }
      } catch (e) {
        console.warn("[reset-password] verifyOtp warning:", e);
      }
    }

    if (targetUserId) {
      // Authenticated reset (e.g. from recovery session or verified token)
      try {
        await supabaseServer.auth.admin.updateUserById(targetUserId, { password, email_confirm: true });
      } catch (e) {
        console.warn("[reset-password] admin.updateUserById warning:", e);
      }
      await supabaseServer.from("profiles").update({ password_hash: passwordHash }).eq("id", targetUserId);
      return apiSuccess({ message: "Password updated successfully." });
    }

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();

      let userId = profile?.id;
      if (!userId) {
        // Fallback: check auth.users if profiles row was somehow missing
        const { data: authList } = await supabaseServer.auth.admin.listUsers();
        const found = authList?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
        if (found) userId = found.id;
      }

      if (userId) {
        try {
          await supabaseServer.auth.admin.updateUserById(userId, { password, email_confirm: true });
        } catch (e) {
          console.warn("[reset-password] admin.updateUserById warning:", e);
        }
        await supabaseServer.from("profiles").update({ password_hash: passwordHash }).eq("id", userId);
        return apiSuccess({ message: "Password updated successfully." });
      }
    }

    return apiError("UNAUTHORIZED", "Valid reset session or account reference required.", 401);
  } catch (err: any) {
    return apiError("INTERNAL_ERROR", "Password reset failed.", 500, err);
  }
}
