import { db } from "ponder:api";
import {
  auditEvents,
  claims,
  contestEntries,
  contests,
  contestWinners,
  contractMetadata,
  matches,
  matchPlayers,
  passports,
  playerStats,
  refunds,
  scoreSubmissions,
  treasuryState,
  userBalances
} from "ponder:schema";
import { desc, eq } from "ponder";
import { Hono } from "hono";
import type { Context } from "hono";
import { getAddress, isAddress } from "viem";

const app = new Hono();

app.get("/healthz", health);

async function health(c: Context) {
  const [latestEvent] = await db.select().from(auditEvents).orderBy(desc(auditEvents.blockNumber)).limit(1);
  return json(c, {
    ok: true,
    service: "wirefluid-indexer",
    latestBlock: latestEvent?.blockNumber ?? null,
    latestEvent: latestEvent
      ? {
          contractName: latestEvent.contractName,
          eventName: latestEvent.eventName,
          blockNumber: latestEvent.blockNumber,
          transactionHash: latestEvent.transactionHash
        }
      : null
  });
}

app.get("/summary", async (c) => {
  const [recentMatches, recentContests, treasury, recentClaims, metadata] = await Promise.all([
    db.select().from(matches).orderBy(desc(matches.updatedAtBlock)).limit(10),
    db.select().from(contests).orderBy(desc(contests.updatedAtBlock)).limit(10),
    db.select().from(treasuryState).limit(1),
    db.select().from(claims).orderBy(desc(claims.blockNumber)).limit(10),
    db.select().from(contractMetadata)
  ]);

  return json(c, {
    recentMatches,
    recentContests,
    treasury: treasury[0] ?? null,
    recentClaims,
    metadata
  });
});

app.get("/matches", async (c) => {
  const rows = await db.select().from(matches).orderBy(desc(matches.updatedAtBlock)).limit(readLimit(c, 100));
  return json(c, rows);
});

app.get("/matches/:matchId", async (c) => {
  const matchId = readBigIntParam(c.req.param("matchId"));
  if (matchId === null) return c.json({ error: "Invalid matchId" }, 400);

  const [match] = await db.select().from(matches).where(eq(matches.matchId, matchId)).limit(1);
  if (!match) return c.json({ error: "Match not found" }, 404);

  const [players, stats, submission, contest] = await Promise.all([
    db.select().from(matchPlayers).where(eq(matchPlayers.matchId, matchId)).orderBy(matchPlayers.playerId),
    db.select().from(playerStats).where(eq(playerStats.matchId, matchId)).orderBy(playerStats.playerId),
    db.select().from(scoreSubmissions).where(eq(scoreSubmissions.matchId, matchId)).limit(1),
    match.contestId
      ? db.select().from(contests).where(eq(contests.contestId, match.contestId)).limit(1)
      : Promise.resolve([])
  ]);

  return json(c, {
    match,
    players,
    stats,
    scoreSubmission: submission[0] ?? null,
    contest: contest[0] ?? null
  });
});

app.get("/matches/:matchId/players", async (c) => {
  const matchId = readBigIntParam(c.req.param("matchId"));
  if (matchId === null) return c.json({ error: "Invalid matchId" }, 400);

  const rows = await db.select().from(matchPlayers).where(eq(matchPlayers.matchId, matchId)).orderBy(matchPlayers.playerId);
  return json(c, rows);
});

app.get("/contests", async (c) => {
  const rows = await db.select().from(contests).orderBy(desc(contests.updatedAtBlock)).limit(readLimit(c, 100));
  return json(c, rows);
});

app.get("/contests/:contestId", async (c) => {
  const contestId = readBigIntParam(c.req.param("contestId"));
  if (contestId === null) return c.json({ error: "Invalid contestId" }, 400);

  const [contest] = await db.select().from(contests).where(eq(contests.contestId, contestId)).limit(1);
  if (!contest) return c.json({ error: "Contest not found" }, 404);

  const [entries, winners, refundRows] = await Promise.all([
    db.select().from(contestEntries).where(eq(contestEntries.contestId, contestId)).orderBy(contestEntries.entryIndex),
    db.select().from(contestWinners).where(eq(contestWinners.contestId, contestId)).orderBy(contestWinners.rank),
    db.select().from(refunds).where(eq(refunds.contestId, contestId)).orderBy(refunds.entryIndex)
  ]);

  return json(c, {
    contest,
    entries,
    winners,
    refunds: refundRows
  });
});

app.get("/contests/:contestId/entries", async (c) => {
  const contestId = readBigIntParam(c.req.param("contestId"));
  if (contestId === null) return c.json({ error: "Invalid contestId" }, 400);

  const rows = await db
    .select()
    .from(contestEntries)
    .where(eq(contestEntries.contestId, contestId))
    .orderBy(contestEntries.entryIndex);
  return json(c, rows);
});

app.get("/contests/:contestId/winners", async (c) => {
  const contestId = readBigIntParam(c.req.param("contestId"));
  if (contestId === null) return c.json({ error: "Invalid contestId" }, 400);

  const rows = await db
    .select()
    .from(contestWinners)
    .where(eq(contestWinners.contestId, contestId))
    .orderBy(contestWinners.rank);
  return json(c, rows);
});

app.get("/leaderboard", async (c) => {
  const contestId = readOptionalBigInt(c.req.query("contestId"));
  if (contestId === "invalid") return c.json({ error: "Invalid contestId" }, 400);

  const rows =
    contestId === null
      ? await db.select().from(contestEntries).orderBy(desc(contestEntries.updatedAtBlock)).limit(readLimit(c, 1000))
      : await db
          .select()
          .from(contestEntries)
          .where(eq(contestEntries.contestId, contestId))
          .orderBy(desc(contestEntries.score));

  return json(c, rows);
});

app.get("/users/:address/passport", async (c) => {
  const address = readAddressParam(c.req.param("address"));
  if (!address) return c.json({ error: "Invalid address" }, 400);

  const [passport, balance] = await Promise.all([
    db.select().from(passports).where(eq(passports.user, address)).limit(1),
    db.select().from(userBalances).where(eq(userBalances.user, address)).limit(1)
  ]);

  return json(c, {
    passport: passport[0] ?? null,
    balance: balance[0] ?? null
  });
});

app.get("/users/:address/balances", async (c) => {
  const address = readAddressParam(c.req.param("address"));
  if (!address) return c.json({ error: "Invalid address" }, 400);

  const [balance] = await db.select().from(userBalances).where(eq(userBalances.user, address)).limit(1);
  return json(c, balance ?? null);
});

app.get("/audit-events", async (c) => {
  const eventName = c.req.query("eventName");
  const contractName = c.req.query("contractName");
  const txHash = c.req.query("txHash");
  const limit = readLimit(c, 100);

  if (txHash) {
    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.transactionHash, txHash as `0x${string}`))
      .orderBy(desc(auditEvents.blockNumber))
      .limit(limit);
    return json(c, rows);
  }

  if (eventName) {
    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.eventName, eventName))
      .orderBy(desc(auditEvents.blockNumber))
      .limit(limit);
    return json(c, rows);
  }

  if (contractName) {
    const rows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.contractName, contractName))
      .orderBy(desc(auditEvents.blockNumber))
      .limit(limit);
    return json(c, rows);
  }

  const rows = await db.select().from(auditEvents).orderBy(desc(auditEvents.blockNumber)).limit(limit);
  return json(c, rows);
});

export default app;

function json(c: Context, value: unknown) {
  return c.body(JSON.stringify(value, bigintReplacer), 200, {
    "content-type": "application/json"
  });
}

function bigintReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

function readLimit(c: Context, fallback: number): number {
  const raw = Number(c.req.query("limit") ?? fallback);
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(Math.trunc(raw), 1), 250);
}

function readBigIntParam(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function readOptionalBigInt(value: string | undefined): bigint | null | "invalid" {
  if (!value) return null;
  try {
    return BigInt(value);
  } catch {
    return "invalid";
  }
}

function readAddressParam(value: string): `0x${string}` | null {
  return isAddress(value) ? getAddress(value) : null;
}
