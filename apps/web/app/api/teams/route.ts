import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listTeams, upsertTeams, teamInputSchema } from "@/server/teams/store";

export async function GET() {
  try {
    const teams = await listTeams();
    return NextResponse.json({ teams });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

const bodySchema = z.object({
  teams: z.array(teamInputSchema).min(1).max(50)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    const rows = await upsertTeams(parsed.data.teams);
    return NextResponse.json({
      teams: rows.map((row) => ({
        teamCode: row.teamCode,
        displayName: row.displayName,
        shortName: row.shortName,
        logoUrl: row.logoUrl,
        active: row.active,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save teams" },
      { status: 500 }
    );
  }
}
