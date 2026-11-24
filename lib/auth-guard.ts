import { NextRequest } from "next/server";
import { verifyRequestSessionDetails, SessionUser } from "./supabase-auth";
import { apiError } from "./api-response";

export interface AuthenticatedAuthResult {
  user: SessionUser;
  errorResponse?: null;
}

export interface UnauthenticatedAuthResult {
  user: null;
  errorResponse: ReturnType<typeof apiError>;
}

export type AuthResult = AuthenticatedAuthResult | UnauthenticatedAuthResult;

/**
 * Server-side authentication guard for Next.js API routes.
 * Supports both Authorization Bearer tokens (from Flutter app) and HTTP-only cookies (from Web UI).
 */
export async function requireAuth(req: NextRequest, allowedRoles?: Array<"user" | "caregiver" | "admin">): Promise<AuthResult> {
  const { user } = await verifyRequestSessionDetails(req);

  if (!user) {
    return {
      user: null,
      errorResponse: apiError("UNAUTHORIZED", "Authentication required. Please sign in to continue.", 401),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      errorResponse: apiError("FORBIDDEN", "You do not have permission to perform this action.", 403),
    };
  }

  return {
    user,
    errorResponse: null,
  };
}

/**
 * Specific helper requiring admin privileges.
 */
export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  return requireAuth(req, ["admin"]);
}
