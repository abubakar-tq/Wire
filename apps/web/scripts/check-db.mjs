import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

// Parse .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envRaw = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envRaw
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const url = env.PLAYER_DATABASE_URL;
if (!url) throw new Error("PLAYER_DATABASE_URL not found in .env.local");

console.log("Connecting to Neon...");
const sql = neon(url);

async function check() {
  // Tables in app schema
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'app'
    ORDER BY table_name
  `;
  console.log("\n=== Tables in app schema ===");
  if (tables.length === 0) {
    console.log("  (none — schema may not exist)");
  } else {
    tables.forEach((t) => console.log(` - app.${t.table_name}`));
  }

  // Players
  const [{ count: playerCount }] = await sql`SELECT COUNT(*) FROM app.players`;
  console.log(`\n=== app.players: ${playerCount} rows ===`);
  const players = await sql`
    SELECT player_id, display_name, team_code, role, active
    FROM app.players ORDER BY player_id LIMIT 8
  `;
  if (players.length > 0) {
    players.forEach((p) =>
      console.log(`  #${p.player_id}  ${p.display_name}  | team: ${p.team_code ?? "-"}  | role: ${p.role ?? "-"}  | active: ${p.active}`)
    );
    if (Number(playerCount) > 8) console.log(`  ... and ${Number(playerCount) - 8} more`);
  } else {
    console.log("  (empty)");
  }

  // Teams
  const [{ count: teamCount }] = await sql`SELECT COUNT(*) FROM app.teams`;
  console.log(`\n=== app.teams: ${teamCount} rows ===`);
  const teams = await sql`
    SELECT team_code, display_name, short_name, active
    FROM app.teams ORDER BY team_code
  `;
  if (teams.length === 0) {
    console.log("  (empty — 6 PSL teams auto-seed on first GET /api/teams request)");
  } else {
    teams.forEach((t) =>
      console.log(`  ${t.team_code}  ${t.display_name}  (${t.short_name ?? "-"})  active: ${t.active}`)
    );
  }

  console.log("\n✅  Database connection verified.\n");
}

check().catch((err) => {
  console.error("\n❌  Database check failed:", err.message);
  process.exit(1);
});
