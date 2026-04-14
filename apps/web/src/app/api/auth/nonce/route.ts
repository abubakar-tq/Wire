import { NextResponse } from "next/server";
import { createNonce, setNonceCookie } from "@/server/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const nonce = createNonce();
  const response = NextResponse.json({ nonce });
  setNonceCookie(response, nonce);
  return response;
}
