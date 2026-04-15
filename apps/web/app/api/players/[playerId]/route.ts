import { NextResponse, type NextRequest } from "next/server";
import { hasAdminAccess, readSessionCookie } from "@/server/auth/session";
import { deletePlayer, getPlayer, playerProfileInputSchema, upsertPlayers } from "@/server/players/store";

export const runtime = "nodejs";

type PlayerRouteContext = {
	params: Promise<{ playerId: string }>;
};

export async function GET(_request: NextRequest, context: PlayerRouteContext) {
	const params = await context.params;
	const playerId = Number(params.playerId);
	if (!Number.isInteger(playerId) || playerId <= 0) {
		return NextResponse.json({ error: "Invalid playerId" }, { status: 400 });
	}

	const player = await getPlayer(playerId);
	if (!player) {
		return NextResponse.json({ error: "Player not found" }, { status: 404 });
	}

	return NextResponse.json({ player });
}

export async function PUT(request: NextRequest, context: PlayerRouteContext) {
	const session = readSessionCookie(request);
	if (!session) {
		return NextResponse.json({ error: "Authentication required" }, { status: 401 });
	}
	if (!hasAdminAccess(session.roles)) {
		return NextResponse.json({ error: "Admin role required" }, { status: 403 });
	}

	const params = await context.params;
	const playerId = Number(params.playerId);
	if (!Number.isInteger(playerId) || playerId <= 0) {
		return NextResponse.json({ error: "Invalid playerId" }, { status: 400 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = playerProfileInputSchema.safeParse({
		...(payload as Record<string, unknown>),
		playerId
	});
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid player payload", details: parsed.error.flatten() }, { status: 400 });
	}

	try {
		const players = await upsertPlayers([parsed.data]);
		return NextResponse.json({ player: players[0] });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Player database error";
		return NextResponse.json({ error: message }, { status: 503 });
	}
}

export async function DELETE(request: NextRequest, context: PlayerRouteContext) {
	const session = readSessionCookie(request);
	if (!session) {
		return NextResponse.json({ error: "Authentication required" }, { status: 401 });
	}
	if (!hasAdminAccess(session.roles)) {
		return NextResponse.json({ error: "Admin role required" }, { status: 403 });
	}

	const params = await context.params;
	const playerId = Number(params.playerId);
	if (!Number.isInteger(playerId) || playerId <= 0) {
		return NextResponse.json({ error: "Invalid playerId" }, { status: 400 });
	}

	try {
		await deletePlayer(playerId);
		return NextResponse.json({ ok: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Player database error";
		return NextResponse.json({ error: message }, { status: 503 });
	}
}
