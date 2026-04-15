# Neon + Drizzle Setup: Indexer DB and Player Profiles

This document explains how to set up the Postgres database for:
- The Ponder indexer (event indexing).
- Player profile storage (names, photos, bio, tags, etc.).

It assumes you are using Neon and Drizzle for migrations.

## 1) Database Overview
- **Indexer data**: stored by Ponder in Postgres (default schema is `public`).
- **Player profiles**: stored in a separate schema called `app` inside the same Postgres database.

You can either:
- **Use one Neon database** (recommended): set both `DATABASE_URL` and `PLAYER_DATABASE_URL` to the same connection string.
- **Use two Neon databases**: keep indexer and player profiles fully isolated.

## 2) Environment Variables

### Indexer (apps/indexer/.env.local)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
PONDER_START_BLOCK=0
WIREFLUID_CHAIN_ID=31337
WIREFLUID_RPC_URL=http://127.0.0.1:8545
```

Notes:
- Ponder will use Postgres if `DATABASE_URL` (or `DATABASE_PRIVATE_URL`) is set.
- Neon requires SSL; include `sslmode=require` in the connection string.

### Web app runtime (apps/web/.env.local)
```
PLAYER_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
AUTH_SESSION_SECRET=replace-with-at-least-32-random-bytes
NEXT_PUBLIC_INDEXER_URL=http://localhost:42069
```

Notes:
- `PLAYER_DATABASE_URL` is **server-only** (do not expose in NEXT_PUBLIC).
- If `PLAYER_DATABASE_URL` is not set, the app falls back to `DATABASE_URL`.

### Drizzle CLI (apps/web/.env)
Drizzle Kit reads from `apps/web/.env` (not `.env.local`). Add:
```
PLAYER_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

## 3) Player Profile Schema (SQL)
Schema: `app`

```
CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.players (
  player_id INTEGER PRIMARY KEY,
  display_name TEXT NOT NULL,
  team_code TEXT,
  role TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS players_team_idx ON app.players (team_code);
```

Notes:
- The schema is managed via Drizzle migrations.
- For production, run migrations via Drizzle (`db:migrate`) instead of relying on runtime creation.

## 4) Drizzle Schema Example
Use a separate schema for player profiles to avoid collisions with Ponder tables.

```ts
import { pgSchema, integer, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const app = pgSchema("app");

export const players = app.table("players", {
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
```

## 5) Drizzle Migrations & Studio
Commands (from repo root):
```
pnpm --filter @wirefluid/web db:generate
pnpm --filter @wirefluid/web db:migrate
pnpm --filter @wirefluid/web db:push
pnpm --filter @wirefluid/web db:studio
```

Notes:
- Migrations live in `apps/web/drizzle` and are committed.
- `db:push` is convenient for dev; `db:migrate` is preferred for production.

## 6) Player Profile API (Web App)
Endpoints (server-side):
- `GET /api/players?ids=1,2,3` -> list
- `GET /api/players/:playerId` -> single
- `POST /api/players` -> create/update (bulk)
- `PUT /api/players/:playerId` -> update
- `DELETE /api/players/:playerId` -> delete

Auth:
- Reads are public.
- Writes require an admin session.

## 7) How Player Data Is Used
- The squad builder merges indexed match players with profile data by `player_id`.
- If a profile is missing, the UI falls back to static metadata or displays `Player {id}`.
- Use `image_url` to point to CDN/S3 or `public/` assets. Do not store binaries in Postgres.

## 8) Future Expansion
For new player data:
- Preferred: add fields in `metadata` (JSONB) for rapid iteration.
- When stable, add columns and a migration.
- Example metadata keys: `birth_date`, `batting_style`, `bowling_style`, `country`, `height_cm`.

For new tables:
- Keep them in the `app` schema: `app.player_stats`, `app.teams`, etc.
- Use Drizzle migrations for versioning and rollback safety.

## 9) Notes on Ponder Indexer Tables
Ponder manages its own tables in Postgres and expects to own the schema it uses. Keep your app data in `app` schema to avoid conflicts. If you change the indexer schema in Ponder config, update this doc accordingly.

## 10) Implementation Notes
- The web app uses the Neon HTTP driver (`@neondatabase/serverless`) with Drizzle for server routes.
- The Drizzle schema lives in `apps/web/src/server/db/schema.ts`.
