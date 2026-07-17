import { NextRequest, NextResponse } from "next/server";

const USER_ROUTES = ["/user"];
const CAREGIVER_ROUTES = ["/caregiver"];
const ADMIN_ROUTES = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("user_role")?.value || "";
  const hasSession = !!token;

  const isUserRoute = matchesPrefix(pathname, USER_ROUTES);
  const isCaregiverRoute = matchesPrefix(pathname, CAREGIVER_ROUTES);
  const isAdminRoute = matchesPrefix(pathname, ADMIN_ROUTES);

  // 1. Unauthenticated → redirect to login
  if ((isUserRoute || isCaregiverRoute || isAdminRoute) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated but trying to access unauthorized role paths
  if (hasSession && role) {
    if (isUserRoute && role !== "user") {
      const dest = role === "caregiver" ? "/caregiver/dashboard" : "/admin/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (isCaregiverRoute && role !== "caregiver") {
      const dest = role === "user" ? "/user/dashboard" : "/admin/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    if (isAdminRoute && role !== "admin") {
      const dest = role === "user" ? "/user/dashboard" : "/caregiver/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  // 3. Already logged-in user hitting /login → send to their home
  if (pathname.startsWith("/login") && hasSession && role) {
    const dest = role === "admin"
      ? "/admin/dashboard"
      : role === "caregiver"
      ? "/caregiver/dashboard"
      : "/user/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/:path*",
    "/caregiver/:path*",
    "/admin/:path*",
    "/login",
  ],
};
