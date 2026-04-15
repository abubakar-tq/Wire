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

/**
 * PSL teams for the current season.
 * The admin selects home/away from this table when creating a match.
 */
export const teams = appSchema.table("teams", {
  teamCode: text("team_code").primaryKey(),
  displayName: text("display_name").notNull(),
  shortName: text("short_name"),
  logoUrl: text("logo_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type TeamRow = typeof teams.$inferSelect;
export type NewTeamRow = typeof teams.$inferInsert;

export const nftMetadata = appSchema.table("nft_metadata", {
  id: text("id").primaryKey(), // e.g. "passport-1", "squad-42"
  nftType: text("nft_type").notNull(), // "passport" or "squad"
  tokenId: integer("token_id").notNull(),
  imageUri: text("image_uri"), // Pinata gateway format ipfs://...
  metadataUri: text("metadata_uri"), // Pinata JSON format ipfs://...
  lastSyncedBlock: integer("last_synced_block").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export type NftMetadataRow = typeof nftMetadata.$inferSelect;
export type NewNftMetadataRow = typeof nftMetadata.$inferInsert;
