import { sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/server/db";
import { teams, type TeamRow } from "@/server/db/schema";

export type TeamProfile = {
  teamCode: string;
  displayName: string;
  shortName: string | null;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export const teamInputSchema = z.object({
  teamCode: z
    .string()
    .min(1)
    .max(12)
    .transform((value) => value.trim().toUpperCase()),
  displayName: z.string().min(1).max(80),
  shortName: z.string().min(1).max(32).optional().nullable(),
  logoUrl: z.string().min(1).optional().nullable(),
  active: z.boolean().optional()
});

export type TeamInput = z.infer<typeof teamInputSchema>;

/** Default PSL teams seeded on first request when the table is empty. */
const PSL_SEED: TeamInput[] = [
  { teamCode: "LQ", displayName: "Lahore Qalandars", shortName: "Lahore" },
  { teamCode: "KK", displayName: "Karachi Kings", shortName: "Karachi" },
  { teamCode: "IU", displayName: "Islamabad United", shortName: "Islamabad" },
  { teamCode: "MS", displayName: "Multan Sultans", shortName: "Multan" },
  { teamCode: "PZ", displayName: "Peshawar Zalmi", shortName: "Peshawar" },
  { teamCode: "QG", displayName: "Quetta Gladiators", shortName: "Quetta" }
];

export async function listTeams(): Promise<TeamProfile[]> {
  if (!isDatabaseConfigured()) {
    return PSL_SEED.map(fallbackTeam);
  }
  const db = getDb();
  let rows = await db.select().from(teams).orderBy(teams.teamCode);

  // Auto-seed PSL teams if the table is empty.
  if (rows.length === 0) {
    rows = await upsertTeams(PSL_SEED);
  }

  return rows.map(mapRow);
}

export async function upsertTeams(inputs: TeamInput[]): Promise<TeamRow[]> {
  if (!isDatabaseConfigured()) {
    throw new Error("Team database is not configured");
  }
  if (inputs.length === 0) return [];
  const db = getDb();

  const values = inputs.map((t) => ({
    teamCode: t.teamCode,
    displayName: t.displayName,
    shortName: t.shortName ?? null,
    logoUrl: t.logoUrl ?? null,
    active: t.active ?? true
  }));

  return db
    .insert(teams)
    .values(values)
    .onConflictDoUpdate({
      target: teams.teamCode,
      set: {
        displayName: sql`excluded.display_name`,
        shortName: sql`excluded.short_name`,
        logoUrl: sql`excluded.logo_url`,
        active: sql`excluded.active`,
        updatedAt: sql`now()`
      }
    })
    .returning();
}

function mapRow(row: TeamRow): TeamProfile {
  return {
    teamCode: row.teamCode,
    displayName: row.displayName,
    shortName: row.shortName,
    logoUrl: row.logoUrl,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

function fallbackTeam(input: TeamInput): TeamProfile {
  const now = new Date().toISOString();
  return {
    teamCode: input.teamCode,
    displayName: input.displayName,
    shortName: input.shortName ?? null,
    logoUrl: input.logoUrl ?? null,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now
  };
}
