import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "./supabase-server";

export type SessionUser = {
  id: string;
  email: string;
  role: "user" | "caregiver" | "admin";
  fullName: string;
  phone: string;
  avatarUrl: string;
};

export interface VerifySessionResult {
  user: SessionUser | null;
  refreshedTokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number;
    role: "user" | "caregiver" | "admin";
  } | null;
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  role: string,
  expiresIn: number = 3600 * 24 * 7
) {
  response.cookies.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600 * 24 * 30, // 30 days
  });

  response.cookies.set("user_role", role, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set("token", "", { maxAge: 0, path: "/" });
  response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("user_role", "", { maxAge: 0, path: "/" });
}

export async function verifyRequestSessionDetails(
  req: NextRequest
): Promise<VerifySessionResult> {
  try {
    let token = req.headers.get("authorization")?.replace("Bearer ", "") || null;
    let refreshToken = req.cookies.get("refresh_token")?.value || null;

    if (!token) {
      token = req.cookies.get("token")?.value || null;
    }

    const supabase = createServerSupabaseClient();
    let authUser = null;
    let newRefreshedTokens: VerifySessionResult["refreshedTokens"] = null;

    if (token) {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        authUser = data.user;
      }
    }

    // If access token failed or was missing, attempt refresh using refresh_token cookie
    if (!authUser && refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (!error && data.session && data.user) {
        authUser = data.user;
        newRefreshedTokens = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
          role: (data.user.user_metadata?.role as any) || "user",
        };
      }
    }

    if (!authUser) {
      return { user: null };
    }

    // Read profile to get role, full name, phone, avatar url
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, phone, avatar_url")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      return { user: null };
    }

    const user: SessionUser = {
      id: profile.id,
      email: profile.email,
      role: profile.role as "user" | "caregiver" | "admin",
      fullName: profile.full_name,
      phone: profile.phone || "",
      avatarUrl: profile.avatar_url || "",
    };

    if (newRefreshedTokens) {
      newRefreshedTokens.role = user.role;
    }

    return {
      user,
      refreshedTokens: newRefreshedTokens,
    };
  } catch (err) {
    console.error("[Session verification error]", err);
    return { user: null };
  }
}

export async function verifyRequestSession(
  req: NextRequest
): Promise<SessionUser | null> {
  const result = await verifyRequestSessionDetails(req);
  return result.user;
}

