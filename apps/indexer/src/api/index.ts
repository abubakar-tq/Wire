import { db } from "ponder:api";
import { contests, matches, treasuryState } from "ponder:schema";
import { desc } from "ponder";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "wirefluid-indexer"
  })
);

app.get("/summary", async (c) => {
  const [recentMatches, recentContests, treasury] = await Promise.all([
    db.select().from(matches).orderBy(desc(matches.updatedAtBlock)).limit(10),
    db.select().from(contests).orderBy(desc(contests.updatedAtBlock)).limit(10),
    db.select().from(treasuryState).limit(1)
  ]);

  return c.json({
    recentMatches,
    recentContests,
    treasury: treasury[0] ?? null
  });
});

export default app;
