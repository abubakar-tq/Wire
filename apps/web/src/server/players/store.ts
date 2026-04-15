import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { PLAYER_METADATA } from "@/lib/playerMetadata";
import { getDb, isDatabaseConfigured } from "@/server/db";
import { players, type PlayerRow } from "@/server/db/schema";

export type PlayerProfile = {
  playerId: number;
  name: string;
  teamCode: string | null;
  role: string | null;
  imageUrl: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export const playerProfileInputSchema = z.object({
  playerId: z.number().int().positive(),
  name: z.string().min(1),
  teamCode: z.string().min(1).max(12).optional().nullable(),
  role: z.enum(["WK", "BAT", "AR", "BOWL"]).optional().nullable(),
  imageUrl: z
    .string()
    .min(1)
    .refine((value) => value.startsWith("/") || isValidUrl(value), "Image must be an absolute URL or a public asset path")
    .optional()
    .nullable(),
  active: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type PlayerProfileInput = z.infer<typeof playerProfileInputSchema>;

export async function listPlayers(options: { ids?: number[] } = {}): Promise<PlayerProfile[]> {
  if (!isDatabaseConfigured()) {
    return fallbackPlayers(options.ids);
  }
  const db = getDb();
  const rows = options.ids?.length
    ? await db.select().from(players).where(inArray(players.playerId, options.ids)).orderBy(players.playerId)
    : await db.select().from(players).orderBy(players.playerId);
  return rows.map(mapRow);
}

export async function getPlayer(playerId: number): Promise<PlayerProfile | null> {
  if (!isDatabaseConfigured()) {
    return fallbackPlayers([playerId])[0] ?? null;
  }
  const db = getDb();
  const rows = await db.select().from(players).where(eq(players.playerId, playerId)).limit(1);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function upsertPlayers(inputs: PlayerProfileInput[]): Promise<PlayerProfile[]> {
  if (!isDatabaseConfigured()) {
    throw new Error("Player database is not configured");
  }
  if (inputs.length === 0) return [];
  const db = getDb();

  const values = inputs.map((p) => ({
    playerId: p.playerId,
    displayName: p.name,
    teamCode: p.teamCode ?? null,
    role: p.role ?? null,
    imageUrl: p.imageUrl ?? null,
    active: p.active ?? true,
    metadata: p.metadata ?? {}
  }));

  const rows = await db
    .insert(players)
    .values(values)
    .onConflictDoUpdate({
      target: players.playerId,
      set: {
        displayName: sql`excluded.display_name`,
        teamCode: sql`excluded.team_code`,
        role: sql`excluded.role`,
        imageUrl: sql`excluded.image_url`,
        active: sql`excluded.active`,
        metadata: sql`excluded.metadata`,
        updatedAt: sql`now()`
      }
    })
    .returning();

  return rows.map(mapRow);
}

export async function deletePlayer(playerId: number): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error("Player database is not configured");
  }
  const db = getDb();
  await db.delete(players).where(eq(players.playerId, playerId));
}

function mapRow(row: PlayerRow): PlayerProfile {
  return {
    playerId: row.playerId,
    name: row.displayName,
    teamCode: row.teamCode,
    role: row.role,
    imageUrl: row.imageUrl,
    active: row.active,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function fallbackPlayers(ids?: number[]): PlayerProfile[] {
  const source = PLAYER_METADATA.filter((player) => !ids || ids.includes(player.id));
  const now = new Date().toISOString();
  return source.map((player) => ({
    playerId: player.id,
    name: player.name,
    teamCode: player.team ?? null,
    role: null,
    imageUrl: player.imageUrl ?? null,
    active: true,
    metadata: {},
    createdAt: now,
    updatedAt: now
  }));
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
