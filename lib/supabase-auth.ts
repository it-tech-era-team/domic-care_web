import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "./supabase-server";

export type SessionUser = {
  id: string;
  email: string;
  role: "user" | "caregiver" | "admin";
  fullName: string;
  phone: string;
  avatarUrl: string;
};

export async function verifyRequestSession(
  req: NextRequest
): Promise<SessionUser | null> {
  try {
    let token = req.headers.get("authorization")?.replace("Bearer ", "") || null;

    if (!token) {
      token = req.cookies.get("token")?.value || null;
    }

    if (!token) {
      return null;
    }

    const supabase = createServerSupabaseClient();
    
    // Validate session with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Read profile to get the role, full name, phone, and avatar url
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, phone, avatar_url")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as "user" | "caregiver" | "admin",
      fullName: profile.full_name,
      phone: profile.phone || "",
      avatarUrl: profile.avatar_url || "",
    };
  } catch (err) {
    console.error("[Session verification error]", err);
    return null;
  }
}
