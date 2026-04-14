import { Pool } from "pg";

export const PLAYER_SCHEMA = "app";

let pool: Pool | null = null;
let schemaReady = false;

export function getDatabaseUrl(): string | null {
  return process.env.PLAYER_DATABASE_URL ?? process.env.DATABASE_URL ?? null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getDbPool(): Pool {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("PLAYER_DATABASE_URL or DATABASE_URL is required");
  }
  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

export async function ensurePlayerSchema(): Promise<void> {
  if (schemaReady) return;
  const db = getDbPool();
  await db.query(`CREATE SCHEMA IF NOT EXISTS ${PLAYER_SCHEMA}`);
  await db.query(`
    CREATE TABLE IF NOT EXISTS ${PLAYER_SCHEMA}.players (
      player_id INTEGER PRIMARY KEY,
      display_name TEXT NOT NULL,
      team_code TEXT,
      role TEXT,
      image_url TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(`CREATE INDEX IF NOT EXISTS players_team_idx ON ${PLAYER_SCHEMA}.players (team_code)`);
  schemaReady = true;
}
