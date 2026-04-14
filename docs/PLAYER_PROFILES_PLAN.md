# Player Profiles, Admin UX, and Indexer Sync Plan

## Goals
- Keep on-chain player IDs and minimal data in contracts.
- Store rich player profiles (name, photo, bio, tags, etc.) in Postgres.
- Use dropdown-driven admin flows for matches/contests/players instead of free-form IDs.
- Expose a clean API to fetch player profiles for the squad builder UI.
- Ensure indexer freshness is visible in the admin UI.

## Proposed Data Model (Postgres)
Schema: `app`

Table: `app.players`
- `player_id` (int, PK)
- `display_name` (text, required)
- `team_code` (text, optional)
- `role` (text enum: WK/BAT/AR/BOWL, optional)
- `image_url` (text, optional)
- `active` (bool, default true)
- `metadata` (jsonb, optional)
- `created_at` (timestamptz, default now)
- `updated_at` (timestamptz, default now)

## Player Profile API
- `GET /api/players?ids=1,2,3` -> list
- `GET /api/players/:playerId` -> single
- `POST /api/players` -> create/update (bulk)
- `PUT /api/players/:playerId` -> update
- `DELETE /api/players/:playerId` -> delete

Auth:
- Reads are public.
- Writes require admin session (same as existing admin routes).

## Admin UX Changes
1. **Match & Contest Creation**
   - Dropdown to select existing matches/contests.
   - Manual override is allowed but hidden behind a "Custom" option.
   - Auto-suggest next ID for new match/contest.
   - Validate lock/start times before submitting.

2. **Set Player Pool**
   - Dropdown of indexed matches.
   - CSV uploader for player pool with validation.

3. **Score Publisher**
   - Dropdown of indexed matches.
   - Pre-fill player rows from selected match.

4. **Diagnostics Panel**
   - Show indexer health status and latest indexed block.
   - Display last indexed event timestamp.

## Player Profile CRUD UI
- Admin page to list players with filters (team, role, active).
- Edit/Create drawer with validation.
- Bulk import from CSV/JSON with preview and error rows.

## Squad Builder Integration
- Fetch player profiles by `player_id` and merge with indexed match players.
- Fallback to on-chain IDs if profile missing.

## Open Decisions
- Media hosting: local `public/` images vs. CDN/S3.
- Local dev DB: run Postgres or add a lightweight fallback.
- Role-based access: reuse admin role checks or introduce a separate app-level role.
