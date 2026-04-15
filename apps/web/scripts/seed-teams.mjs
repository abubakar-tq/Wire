import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve } from "path";

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

const sql = neon(url);

const PSL_TEAMS = [
  { team_code: "LQ", display_name: "Lahore Qalandars",    short_name: "Lahore" },
  { team_code: "KK", display_name: "Karachi Kings",        short_name: "Karachi" },
  { team_code: "IU", display_name: "Islamabad United",     short_name: "Islamabad" },
  { team_code: "MS", display_name: "Multan Sultans",       short_name: "Multan" },
  { team_code: "PZ", display_name: "Peshawar Zalmi",       short_name: "Peshawar" },
  { team_code: "QG", display_name: "Quetta Gladiators",    short_name: "Quetta" },
];

async function seed() {
  console.log("Seeding PSL teams into app.teams...\n");

  for (const team of PSL_TEAMS) {
    await sql`
      INSERT INTO app.teams (team_code, display_name, short_name, active)
      VALUES (${team.team_code}, ${team.display_name}, ${team.short_name}, true)
      ON CONFLICT (team_code) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            short_name   = EXCLUDED.short_name,
            active       = EXCLUDED.active,
            updated_at   = now()
    `;
    console.log(`  ✓ ${team.team_code}  ${team.display_name}`);
  }

  // Verify
  const teams = await sql`SELECT team_code, display_name, short_name, active FROM app.teams ORDER BY team_code`;
  console.log(`\n=== app.teams after seed: ${teams.length} rows ===`);
  teams.forEach((t) => console.log(`  ${t.team_code}  ${t.display_name}  (${t.short_name})  active: ${t.active}`));

  console.log("\n✅  PSL teams seeded successfully.\n");
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
