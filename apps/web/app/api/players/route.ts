import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hasAdminAccess, readSessionCookie } from "@/server/auth/session";
import { listPlayers, playerProfileInputSchema, upsertPlayers } from "@/server/players/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0)
    : undefined;

  const players = await listPlayers({ ids });
  return NextResponse.json({ players });
}

export async function POST(request: NextRequest) {
  const session = readSessionCookie(request);
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (!hasAdminAccess(session.roles)) {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const input = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && "players" in payload
      ? (payload as { players: unknown }).players
      : payload
        ? [payload]
        : [];

  const parsed = z.array(playerProfileInputSchema).safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid player payload", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const players = await upsertPlayers(parsed.data);
    return NextResponse.json({ players });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Player database error";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
