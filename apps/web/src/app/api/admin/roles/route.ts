import { NextResponse, type NextRequest } from "next/server";
import { getRoleSnapshot } from "@/server/auth/roleChecks";
import { hasAdminAccess, readSessionCookie } from "@/server/auth/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = readSessionCookie(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const roles = await getRoleSnapshot(session.address);
  if (!hasAdminAccess(roles)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  return NextResponse.json({
    address: session.address,
    chainId: session.chainId,
    roles
  });
}
