import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/supabase-auth";

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
