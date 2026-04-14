import { boolean, integer, jsonb, pgSchema, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * All app-level tables live in the `app` schema to avoid collisions
 * with Ponder's indexer tables which use the `public` schema.
 */
export const appSchema = pgSchema("app");

export const players = appSchema.table("players", {
  playerId: integer("player_id").primaryKey(),
  displayName: text("display_name").notNull(),
  teamCode: text("team_code"),
  role: text("role"),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  metadata: jsonb("metadata").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type PlayerRow = typeof players.$inferSelect;
export type NewPlayerRow = typeof players.$inferInsert;
