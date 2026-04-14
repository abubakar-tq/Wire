import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

export const PLAYER_SCHEMA = "app";

export function getDatabaseUrl(): string | null {
  return process.env.PLAYER_DATABASE_URL ?? process.env.DATABASE_URL ?? null;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Returns a Drizzle client connected to Neon via the HTTP driver.
 * The HTTP driver is serverless-friendly and works in Next.js server components/routes.
 * Throws if the connection string is not set.
 */
export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (_db) return _db;
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("PLAYER_DATABASE_URL or DATABASE_URL is required");
  }
  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}
