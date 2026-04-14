import { NextResponse, type NextRequest } from "next/server";
import { readSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = readSessionCookie(request);
  if (!session) {
    return NextResponse.json({ authenticated: false, session: null });
  }
  return NextResponse.json({ authenticated: true, session });
}
