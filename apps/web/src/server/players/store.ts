import { z } from "zod";
import { PLAYER_METADATA } from "@/lib/playerMetadata";
import { ensurePlayerSchema, getDbPool, isDatabaseConfigured, PLAYER_SCHEMA } from "@/server/db";

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
  imageUrl: z.string().url().optional().nullable(),
  active: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type PlayerProfileInput = z.infer<typeof playerProfileInputSchema>;

export async function listPlayers(options: { ids?: number[] } = {}): Promise<PlayerProfile[]> {
  if (!isDatabaseConfigured()) {
    return fallbackPlayers(options.ids);
  }
  await ensurePlayerSchema();
  const db = getDbPool();
  const ids = options.ids?.length ? options.ids : null;
  const result = ids
    ? await db.query(
        `SELECT player_id, display_name, team_code, role, image_url, active, metadata, created_at, updated_at
         FROM ${PLAYER_SCHEMA}.players
         WHERE player_id = ANY($1)
         ORDER BY player_id ASC`,
        [ids]
      )
    : await db.query(
        `SELECT player_id, display_name, team_code, role, image_url, active, metadata, created_at, updated_at
         FROM ${PLAYER_SCHEMA}.players
         ORDER BY player_id ASC`
      );
  return result.rows.map(mapRow);
}

export async function getPlayer(playerId: number): Promise<PlayerProfile | null> {
  if (!isDatabaseConfigured()) {
    return fallbackPlayers([playerId])[0] ?? null;
  }
  await ensurePlayerSchema();
  const db = getDbPool();
  const result = await db.query(
    `SELECT player_id, display_name, team_code, role, image_url, active, metadata, created_at, updated_at
     FROM ${PLAYER_SCHEMA}.players
     WHERE player_id = $1`,
    [playerId]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function upsertPlayers(players: PlayerProfileInput[]): Promise<PlayerProfile[]> {
  if (!isDatabaseConfigured()) {
    throw new Error("Player database is not configured");
  }
  if (players.length === 0) return [];
  await ensurePlayerSchema();
  const db = getDbPool();
  const values: unknown[] = [];
  const rowsSql: string[] = [];
  let idx = 1;
  for (const player of players) {
    rowsSql.push(
      `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
    );
    values.push(
      player.playerId,
      player.name,
      player.teamCode ?? null,
      player.role ?? null,
      player.imageUrl ?? null,
      player.active ?? true,
      JSON.stringify(player.metadata ?? {})
    );
  }

  const result = await db.query(
    `INSERT INTO ${PLAYER_SCHEMA}.players
      (player_id, display_name, team_code, role, image_url, active, metadata)
     VALUES ${rowsSql.join(", ")}
     ON CONFLICT (player_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       team_code = EXCLUDED.team_code,
       role = EXCLUDED.role,
       image_url = EXCLUDED.image_url,
       active = EXCLUDED.active,
       metadata = EXCLUDED.metadata,
       updated_at = NOW()
     RETURNING player_id, display_name, team_code, role, image_url, active, metadata, created_at, updated_at`,
    values
  );
  return result.rows.map(mapRow);
}

export async function deletePlayer(playerId: number): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error("Player database is not configured");
  }
  await ensurePlayerSchema();
  const db = getDbPool();
  await db.query(`DELETE FROM ${PLAYER_SCHEMA}.players WHERE player_id = $1`, [playerId]);
}

function mapRow(row: Record<string, unknown>): PlayerProfile {
  return {
    playerId: Number(row.player_id),
    name: String(row.display_name),
    teamCode: row.team_code ? String(row.team_code) : null,
    role: row.role ? String(row.role) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    active: Boolean(row.active),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString()
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
