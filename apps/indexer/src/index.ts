import {
  auditEvents,
  contestEntries,
  contests,
  contestWinners,
  matches,
  matchPlayers,
  passports,
  playerStats,
  refunds,
  squads,
  treasuryState,
  userBalances
} from "ponder:schema";
import { type Context, type Event, ponder } from "ponder:registry";
import { eq } from "ponder";
import { zeroAddress, type Address } from "viem";

const TREASURY_ID = "singleton";

ponder.on("MatchRegistry:MatchCreated", async ({ event, context }) => {
  await recordAudit(context, event, "MatchRegistry", "MatchCreated");
  await context.db
    .insert(matches)
    .values({
      id: id(event.args.matchId),
      matchId: event.args.matchId,
      homeTeam: event.args.homeTeam,
      awayTeam: event.args.awayTeam,
      startTime: BigInt(event.args.startTime),
      lockTime: BigInt(event.args.lockTime),
      status: 0,
      operator: event.args.operator,
      createdTxHash: event.transaction.hash,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      homeTeam: event.args.homeTeam,
      awayTeam: event.args.awayTeam,
      startTime: BigInt(event.args.startTime),
      lockTime: BigInt(event.args.lockTime),
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    });
});

ponder.on("MatchRegistry:MatchPlayersSet", async ({ event, context }) => {
  await recordAudit(context, event, "MatchRegistry", "MatchPlayersSet");

  await context.db.sql.delete(matchPlayers).where(eq(matchPlayers.matchId, event.args.matchId));

  for (let i = 0; i < event.args.playerIds.length; i += 1) {
    const playerId = Number(event.args.playerIds[i]);
    await context.db.insert(matchPlayers).values({
      id: `${event.args.matchId.toString()}-${playerId.toString()}`,
      matchId: event.args.matchId,
      playerId,
      role: Number(event.args.roles[i]),
      teamSide: Number(event.args.teamSides[i]),
      allowed: true,
      updatedAtBlock: event.block.number
    });
  }

  await context.db
    .insert(matches)
    .values({
      id: id(event.args.matchId),
      matchId: event.args.matchId,
      homeTeam: "0x",
      awayTeam: "0x",
      startTime: 0n,
      lockTime: 0n,
      status: 0,
      operator: event.args.operator,
      playerCount: Number(event.args.playerCount),
      createdTxHash: event.transaction.hash,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      playerCount: Number(event.args.playerCount),
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    });
});

ponder.on("MatchRegistry:MatchStatusUpdated", async ({ event, context }) => {
  await recordAudit(context, event, "MatchRegistry", "MatchStatusUpdated");
  await context.db
    .insert(matches)
    .values({
      id: id(event.args.matchId),
      matchId: event.args.matchId,
      homeTeam: "0x",
      awayTeam: "0x",
      startTime: 0n,
      lockTime: 0n,
      status: Number(event.args.newStatus),
      operator: event.args.updater,
      createdTxHash: event.transaction.hash,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      status: Number(event.args.newStatus),
      operator: event.args.updater,
      updatedAtBlock: event.block.number
    });
});

ponder.on("FantasyTeamNFT:SquadMinted", async ({ event, context }) => {
  await recordAudit(context, event, "FantasyTeamNFT", "SquadMinted");
  await context.db
    .insert(squads)
    .values({
      id: id(event.args.tokenId),
      tokenId: event.args.tokenId,
      owner: event.args.owner,
      matchId: event.args.matchId,
      playerIds: event.args.playerIds.map(Number),
      captainId: Number(event.args.captainId),
      viceCaptainId: Number(event.args.viceCaptainId),
      updatedBy: event.args.minter,
      mintedAtBlock: event.block.number,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      owner: event.args.owner,
      matchId: event.args.matchId,
      playerIds: event.args.playerIds.map(Number),
      captainId: Number(event.args.captainId),
      viceCaptainId: Number(event.args.viceCaptainId),
      updatedBy: event.args.minter,
      updatedAtBlock: event.block.number
    });
});

ponder.on("FantasyTeamNFT:SquadUpdated", async ({ event, context }) => {
  await recordAudit(context, event, "FantasyTeamNFT", "SquadUpdated");
  await context.db
    .insert(squads)
    .values({
      id: id(event.args.tokenId),
      tokenId: event.args.tokenId,
      owner: zeroAddress,
      matchId: event.args.matchId,
      playerIds: event.args.playerIds.map(Number),
      captainId: Number(event.args.captainId),
      viceCaptainId: Number(event.args.viceCaptainId),
      updatedBy: event.args.updatedBy,
      mintedAtBlock: event.block.number,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      matchId: event.args.matchId,
      playerIds: event.args.playerIds.map(Number),
      captainId: Number(event.args.captainId),
      viceCaptainId: Number(event.args.viceCaptainId),
      updatedBy: event.args.updatedBy,
      updatedAtBlock: event.block.number
    });
});

ponder.on("FantasyTeamNFT:BaseURIUpdated", async ({ event, context }) => {
  await recordAudit(context, event, "FantasyTeamNFT", "BaseURIUpdated");
});

ponder.on("LegacyPassport:LegacyPassportMinted", async ({ event, context }) => {
  await recordAudit(context, event, "LegacyPassport", "LegacyPassportMinted");
  await context.db
    .insert(passports)
    .values({
      id: event.args.user.toLowerCase(),
      user: event.args.user,
      tokenId: event.args.tokenId,
      mintedAtBlock: event.block.number,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      tokenId: event.args.tokenId,
      updatedAtBlock: event.block.number
    });
});

ponder.on("LegacyPassport:LegacyEntryRecorded", async ({ event, context }) => {
  await recordAudit(context, event, "LegacyPassport", "LegacyEntryRecorded");
  await upsertPassportActivity(context, event.args.user, {
    tokenId: event.args.tokenId,
    contestsEntered: Number(event.args.contestsEntered),
    firstJoinedAt: BigInt(event.args.firstJoinedAt),
    lastActiveAt: BigInt(event.args.lastActiveAt),
    updatedAtBlock: event.block.number
  });
});

ponder.on("LegacyPassport:LegacyWinRecorded", async ({ event, context }) => {
  await recordAudit(context, event, "LegacyPassport", "LegacyWinRecorded");
  await upsertPassportActivity(context, event.args.user, {
    tokenId: event.args.tokenId,
    contestsWon: Number(event.args.contestsWon),
    lastActiveAt: BigInt(event.args.lastActiveAt),
    updatedAtBlock: event.block.number
  });
});

ponder.on("LegacyPassport:LegacyRewardRecorded", async ({ event, context }) => {
  await recordAudit(context, event, "LegacyPassport", "LegacyRewardRecorded");
  await upsertPassportActivity(context, event.args.user, {
    tokenId: event.args.tokenId,
    totalRewardsClaimed: event.args.totalRewardsClaimed,
    lastActiveAt: BigInt(event.args.lastActiveAt),
    updatedAtBlock: event.block.number
  });
});

ponder.on("LegacyPassport:LegacyPassportBaseURIUpdated", async ({ event, context }) => {
  await recordAudit(context, event, "LegacyPassport", "LegacyPassportBaseURIUpdated");
});

ponder.on("ScoreManager:PlayerStatsRecorded", async ({ event, context }) => {
  await recordAudit(context, event, "ScoreManager", "PlayerStatsRecorded");
  await context.db
    .insert(playerStats)
    .values({
      id: `${event.args.matchId.toString()}-${Number(event.args.playerId).toString()}`,
      matchId: event.args.matchId,
      playerId: Number(event.args.playerId),
      runs: Number(event.args.runs),
      fours: Number(event.args.fours),
      sixes: Number(event.args.sixes),
      wickets: Number(event.args.wickets),
      maidens: Number(event.args.maidens),
      catches: Number(event.args.catches),
      stumpings: Number(event.args.stumpings),
      runOutDirect: Number(event.args.runOutDirect),
      runOutIndirect: Number(event.args.runOutIndirect),
      duck: event.args.duck,
      inStartingXI: event.args.inStartingXI,
      substituteAppearance: event.args.substituteAppearance,
      points: Number(event.args.points),
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      runs: Number(event.args.runs),
      fours: Number(event.args.fours),
      sixes: Number(event.args.sixes),
      wickets: Number(event.args.wickets),
      maidens: Number(event.args.maidens),
      catches: Number(event.args.catches),
      stumpings: Number(event.args.stumpings),
      runOutDirect: Number(event.args.runOutDirect),
      runOutIndirect: Number(event.args.runOutIndirect),
      duck: event.args.duck,
      inStartingXI: event.args.inStartingXI,
      substituteAppearance: event.args.substituteAppearance,
      points: Number(event.args.points),
      updatedAtBlock: event.block.number
    });
});

ponder.on("ScoreManager:PlayerPointsComputed", async ({ event, context }) => {
  await recordAudit(context, event, "ScoreManager", "PlayerPointsComputed");
});

ponder.on("ScoreManager:MatchStatsSubmitted", async ({ event, context }) => {
  await recordAudit(context, event, "ScoreManager", "MatchStatsSubmitted");
});

ponder.on("ContestManager:ContestCreated", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "ContestCreated");
  await context.db
    .insert(contests)
    .values({
      id: id(event.args.contestId),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryFee: event.args.entryFee,
      maxEntries: Number(event.args.maxEntries),
      maxEntriesPerWallet: Number(event.args.maxEntriesPerWallet),
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      matchId: event.args.matchId,
      entryFee: event.args.entryFee,
      maxEntries: Number(event.args.maxEntries),
      maxEntriesPerWallet: Number(event.args.maxEntriesPerWallet),
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    });
  await context.db
    .insert(matches)
    .values({
      id: id(event.args.matchId),
      matchId: event.args.matchId,
      homeTeam: "0x",
      awayTeam: "0x",
      startTime: 0n,
      lockTime: 0n,
      status: 0,
      operator: event.args.operator,
      contestId: event.args.contestId,
      createdTxHash: event.transaction.hash,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      contestId: event.args.contestId,
      updatedAtBlock: event.block.number
    });
});

ponder.on("ContestManager:ContestJoined", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "ContestJoined");
  await context.db
    .insert(contestEntries)
    .values({
      id: entryId(event.args.contestId, event.args.entryIndex),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryIndex: Number(event.args.entryIndex),
      user: event.args.user,
      tokenId: event.args.tokenId,
      passportTokenId: event.args.passportTokenId,
      joinedAtBlock: event.block.number,
      joinedTxHash: event.transaction.hash,
      updatedAtBlock: event.block.number
    })
    .onConflictDoNothing();
  await context.db
    .insert(contests)
    .values({
      id: id(event.args.contestId),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryFee: 0n,
      maxEntries: 0,
      maxEntriesPerWallet: 0,
      totalEntries: Number(event.args.entryIndex) + 1,
      operator: event.args.user,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate((row) => ({
      totalEntries: Math.max(row.totalEntries, Number(event.args.entryIndex) + 1),
      updatedAtBlock: event.block.number
    }));
});

ponder.on("ContestManager:EntryScoreComputed", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "EntryScoreComputed");
  await context.db
    .insert(contestEntries)
    .values({
      id: entryId(event.args.contestId, event.args.entryIndex),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryIndex: Number(event.args.entryIndex),
      user: event.args.user,
      tokenId: event.args.tokenId,
      passportTokenId: 0n,
      score: Number(event.args.score),
      joinedAtBlock: event.block.number,
      joinedTxHash: event.transaction.hash,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      score: Number(event.args.score),
      updatedAtBlock: event.block.number
    });
});

ponder.on("ContestManager:ContestWinnerRecorded", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "ContestWinnerRecorded");
  await context.db
    .insert(contestWinners)
    .values({
      id: `${event.args.contestId.toString()}-${Number(event.args.rank).toString()}`,
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      rank: Number(event.args.rank),
      entryIndex: Number(event.args.entryIndex),
      user: event.args.user,
      tokenId: event.args.tokenId,
      score: Number(event.args.score),
      reward: event.args.reward,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      user: event.args.user,
      entryIndex: Number(event.args.entryIndex),
      tokenId: event.args.tokenId,
      score: Number(event.args.score),
      reward: event.args.reward,
      updatedAtBlock: event.block.number
    });
  await creditUserBalance(context, event.args.user, {
    rewardCreditDelta: event.args.reward,
    blockNumber: event.block.number
  });
});

ponder.on("ContestManager:TreasuryAccrued", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "TreasuryAccrued");
  await context.db
    .insert(treasuryState)
    .values({
      id: TREASURY_ID,
      claimable: event.args.newTreasuryClaimable,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      claimable: event.args.newTreasuryClaimable,
      updatedAtBlock: event.block.number
    });
});

ponder.on("ContestManager:ContestFinalized", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "ContestFinalized");
  await context.db
    .insert(contests)
    .values({
      id: id(event.args.contestId),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryFee: 0n,
      maxEntries: 0,
      maxEntriesPerWallet: 0,
      totalEntries: Number(event.args.totalEntries),
      finalized: true,
      prizePool: event.args.prizePool,
      treasuryFee: event.args.treasuryFee,
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      totalEntries: Number(event.args.totalEntries),
      finalized: true,
      prizePool: event.args.prizePool,
      treasuryFee: event.args.treasuryFee,
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    });
});

ponder.on("ContestManager:RefundCredited", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "RefundCredited");
  await context.db
    .insert(refunds)
    .values({
      id: entryId(event.args.contestId, event.args.entryIndex),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryIndex: Number(event.args.entryIndex),
      user: event.args.user,
      tokenId: event.args.tokenId,
      amount: event.args.amount,
      newRefundableAmount: event.args.newRefundableAmount,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      amount: event.args.amount,
      newRefundableAmount: event.args.newRefundableAmount,
      updatedAtBlock: event.block.number
    });
  await creditUserBalance(context, event.args.user, {
    refundableAmount: event.args.newRefundableAmount,
    blockNumber: event.block.number
  });
});

ponder.on("ContestManager:ContestCancelled", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "ContestCancelled");
  await context.db
    .insert(contests)
    .values({
      id: id(event.args.contestId),
      contestId: event.args.contestId,
      matchId: event.args.matchId,
      entryFee: 0n,
      maxEntries: 0,
      maxEntriesPerWallet: 0,
      cancelled: true,
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      cancelled: true,
      operator: event.args.operator,
      updatedAtBlock: event.block.number
    });
});

ponder.on("ContestManager:RewardClaimed", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "RewardClaimed");
  await creditUserBalance(context, event.args.user, {
    rewardClaimedDelta: event.args.amount,
    blockNumber: event.block.number
  });
});

ponder.on("ContestManager:RefundClaimed", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "RefundClaimed");
  await creditUserBalance(context, event.args.user, {
    refundClaimedDelta: event.args.amount,
    blockNumber: event.block.number
  });
});

ponder.on("ContestManager:TreasuryUpdated", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "TreasuryUpdated");
  await context.db
    .insert(treasuryState)
    .values({
      id: TREASURY_ID,
      treasury: event.args.newTreasury,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate({
      treasury: event.args.newTreasury,
      updatedAtBlock: event.block.number
    });
});

ponder.on("ContestManager:TreasuryClaimed", async ({ event, context }) => {
  await recordAudit(context, event, "ContestManager", "TreasuryClaimed");
  await context.db
    .insert(treasuryState)
    .values({
      id: TREASURY_ID,
      treasury: event.args.treasury,
      claimable: 0n,
      totalClaimed: event.args.amount,
      updatedAtBlock: event.block.number
    })
    .onConflictDoUpdate((row) => ({
      treasury: event.args.treasury,
      claimable: 0n,
      totalClaimed: row.totalClaimed + event.args.amount,
      updatedAtBlock: event.block.number
    }));
});

type ArenaContext = Context;
type ArenaEvent = Event;

async function recordAudit(context: ArenaContext, event: ArenaEvent, contractName: string, eventName: string) {
  await context.db
    .insert(auditEvents)
    .values({
      id: event.id,
      contractName,
      eventName,
      chainId: context.chain.id,
      blockNumber: event.block.number,
      blockTimestamp: event.block.timestamp,
      logIndex: event.log.logIndex,
      transactionHash: event.transaction.hash,
      contractAddress: event.log.address,
      args: serializeArgs(event.args)
    })
    .onConflictDoNothing();
}

async function upsertPassportActivity(
  context: ArenaContext,
  user: Address,
  values: {
    tokenId: bigint;
    contestsEntered?: number;
    contestsWon?: number;
    totalRewardsClaimed?: bigint;
    firstJoinedAt?: bigint;
    lastActiveAt: bigint;
    updatedAtBlock: bigint;
  }
) {
  await context.db
    .insert(passports)
    .values({
      id: user.toLowerCase(),
      user,
      tokenId: values.tokenId,
      contestsEntered: values.contestsEntered ?? 0,
      contestsWon: values.contestsWon ?? 0,
      totalRewardsClaimed: values.totalRewardsClaimed ?? 0n,
      firstJoinedAt: values.firstJoinedAt ?? 0n,
      lastActiveAt: values.lastActiveAt,
      mintedAtBlock: values.updatedAtBlock,
      updatedAtBlock: values.updatedAtBlock
    })
    .onConflictDoUpdate(
      compact({
        tokenId: values.tokenId,
        contestsEntered: values.contestsEntered,
        contestsWon: values.contestsWon,
        totalRewardsClaimed: values.totalRewardsClaimed,
        firstJoinedAt: values.firstJoinedAt,
        lastActiveAt: values.lastActiveAt,
        updatedAtBlock: values.updatedAtBlock
      })
    );
}

async function creditUserBalance(
  context: ArenaContext,
  user: Address,
  values: {
    rewardCreditDelta?: bigint;
    rewardClaimedDelta?: bigint;
    refundClaimedDelta?: bigint;
    refundableAmount?: bigint;
    blockNumber: bigint;
  }
) {
  await context.db
    .insert(userBalances)
    .values({
      id: user.toLowerCase(),
      user,
      claimableReward: values.rewardCreditDelta ?? 0n,
      refundableAmount: values.refundableAmount ?? 0n,
      totalRewardsClaimed: values.rewardClaimedDelta ?? 0n,
      totalRefundsClaimed: values.refundClaimedDelta ?? 0n,
      updatedAtBlock: values.blockNumber
    })
    .onConflictDoUpdate((row) => ({
      claimableReward:
        values.rewardClaimedDelta !== undefined
          ? row.claimableReward - values.rewardClaimedDelta
          : row.claimableReward + (values.rewardCreditDelta ?? 0n),
      refundableAmount:
        values.refundableAmount !== undefined
          ? values.refundableAmount
          : values.refundClaimedDelta !== undefined
            ? row.refundableAmount - values.refundClaimedDelta
            : row.refundableAmount,
      totalRewardsClaimed: row.totalRewardsClaimed + (values.rewardClaimedDelta ?? 0n),
      totalRefundsClaimed: row.totalRefundsClaimed + (values.refundClaimedDelta ?? 0n),
      updatedAtBlock: values.blockNumber
    }));
}

function id(value: bigint | number): string {
  return value.toString();
}

function entryId(contestId: bigint, entryIndex: bigint | number): string {
  return `${contestId.toString()}-${Number(entryIndex).toString()}`;
}

function serializeArgs(value: unknown): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue: unknown) =>
      typeof currentValue === "bigint" ? currentValue.toString() : currentValue
    )
  ) as Record<string, unknown>;
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}
