import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Standardized successful API response.
 */
export function apiSuccess<T>(data: T, status: number = 200, headers?: HeadersInit): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  return NextResponse.json(body, { status, headers });
}

/**
 * Standardized error API response.
 * Logs the real error details server-side while returning a friendly message to the client.
 */
export function apiError(
  code: string,
  userMessage: string,
  status: number = 400,
  serverDetails?: any
): NextResponse {
  console.error(`[API Error - ${code}] ${userMessage}`, serverDetails ? JSON.stringify(serverDetails) : "");
  
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message: userMessage,
    },
  };
  return NextResponse.json(body, { status });
}
