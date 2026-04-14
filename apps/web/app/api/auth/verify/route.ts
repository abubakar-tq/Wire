import { NextResponse, type NextRequest } from "next/server";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";
import { z } from "zod";
import { WIREFLUID_TESTNET_CHAIN_ID } from "@wirefluid/contracts";
import { getRoleSnapshot } from "@/server/auth/roleChecks";
import {
  clearNonceCookie,
  hasAdminAccess,
  readNonceCookie,
  setSessionCookie,
  type AuthSession
} from "@/server/auth/session";

export const runtime = "nodejs";

const verifyBody = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/)
});

export async function POST(request: NextRequest) {
  const parsed = verifyBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid SIWE payload" }, { status: 400 });
  }

  const nonce = readNonceCookie(request);
  if (!nonce) {
    return NextResponse.json({ error: "Missing or expired nonce" }, { status: 401 });
  }

  const host = request.headers.get("host") ?? "";
  const siweMessage = new SiweMessage(parsed.data.message);
  const verification = await siweMessage.verify({
    signature: parsed.data.signature,
    domain: host,
    nonce
  });

  if (!verification.success || siweMessage.chainId !== WIREFLUID_TESTNET_CHAIN_ID) {
    const response = NextResponse.json({ error: "SIWE verification failed" }, { status: 401 });
    clearNonceCookie(response);
    return response;
  }

  const address = getAddress(siweMessage.address);
  const roles = await getRoleSnapshot(address);
  if (!hasAdminAccess(roles)) {
    const response = NextResponse.json({ error: "Wallet does not have admin access" }, { status: 403 });
    clearNonceCookie(response);
    return response;
  }

  const now = Date.now();
  const session: AuthSession = {
    address,
    chainId: WIREFLUID_TESTNET_CHAIN_ID,
    roles,
    issuedAt: now,
    expiresAt: now + 8 * 60 * 60 * 1000
  };

  const response = NextResponse.json({ authenticated: true, session });
  clearNonceCookie(response);
  setSessionCookie(response, session);
  return response;
}
