import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ authenticated: false });
  clearSessionCookie(response);
  return response;
}
