import { index, onchainTable } from "ponder";

export const auditEvents = onchainTable(
  "audit_events",
  (t) => ({
    id: t.text().primaryKey(),
    contractName: t.text().notNull(),
    eventName: t.text().notNull(),
    chainId: t.integer().notNull(),
    blockNumber: t.bigint().notNull(),
    blockTimestamp: t.bigint().notNull(),
    logIndex: t.integer().notNull(),
    transactionHash: t.hex().notNull(),
    contractAddress: t.hex().notNull(),
    args: t.json().$type<Record<string, unknown>>().notNull()
  }),
  (table) => ({
    eventIdx: index().on(table.eventName),
    txIdx: index().on(table.transactionHash),
    blockIdx: index().on(table.blockNumber)
  })
);

export const matches = onchainTable(
  "matches",
  (t) => ({
    id: t.text().primaryKey(),
    matchId: t.bigint().notNull(),
    homeTeam: t.hex().notNull(),
    awayTeam: t.hex().notNull(),
    startTime: t.bigint().notNull(),
    lockTime: t.bigint().notNull(),
    status: t.integer().notNull(),
    operator: t.hex().notNull(),
    playerCount: t.integer().default(0).notNull(),
    contestId: t.bigint(),
    createdTxHash: t.hex().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    statusIdx: index().on(table.status),
    lockIdx: index().on(table.lockTime)
  })
);

export const matchPlayers = onchainTable(
  "match_players",
  (t) => ({
    id: t.text().primaryKey(),
    matchId: t.bigint().notNull(),
    playerId: t.integer().notNull(),
    role: t.integer().notNull(),
    teamSide: t.integer().notNull(),
    allowed: t.boolean().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    matchIdx: index().on(table.matchId),
    playerIdx: index().on(table.playerId)
  })
);

export const squads = onchainTable(
  "squads",
  (t) => ({
    id: t.text().primaryKey(),
    tokenId: t.bigint().notNull(),
    owner: t.hex().notNull(),
    matchId: t.bigint().notNull(),
    playerIds: t.json().$type<number[]>().notNull(),
    captainId: t.integer().notNull(),
    viceCaptainId: t.integer().notNull(),
    updatedBy: t.hex().notNull(),
    mintedAtBlock: t.bigint().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    ownerIdx: index().on(table.owner),
    matchIdx: index().on(table.matchId)
  })
);

export const passports = onchainTable(
  "passports",
  (t) => ({
    id: t.text().primaryKey(),
    user: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    contestsEntered: t.integer().default(0).notNull(),
    contestsWon: t.integer().default(0).notNull(),
    totalRewardsClaimed: t.bigint().default(0n).notNull(),
    firstJoinedAt: t.bigint().default(0n).notNull(),
    lastActiveAt: t.bigint().default(0n).notNull(),
    mintedAtBlock: t.bigint().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    userIdx: index().on(table.user),
    tokenIdx: index().on(table.tokenId)
  })
);

export const playerStats = onchainTable(
  "player_stats",
  (t) => ({
    id: t.text().primaryKey(),
    matchId: t.bigint().notNull(),
    playerId: t.integer().notNull(),
    runs: t.integer().notNull(),
    fours: t.integer().notNull(),
    sixes: t.integer().notNull(),
    wickets: t.integer().notNull(),
    maidens: t.integer().notNull(),
    catches: t.integer().notNull(),
    stumpings: t.integer().notNull(),
    runOutDirect: t.integer().notNull(),
    runOutIndirect: t.integer().notNull(),
    duck: t.boolean().notNull(),
    inStartingXI: t.boolean().notNull(),
    substituteAppearance: t.boolean().notNull(),
    points: t.integer().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    matchIdx: index().on(table.matchId),
    playerIdx: index().on(table.playerId)
  })
);

export const scoreSubmissions = onchainTable(
  "score_submissions",
  (t) => ({
    id: t.text().primaryKey(),
    matchId: t.bigint().notNull(),
    playerCount: t.integer().notNull(),
    publisher: t.hex().notNull(),
    submittedAtBlock: t.bigint().notNull(),
    submittedAtTimestamp: t.bigint().notNull(),
    transactionHash: t.hex().notNull()
  }),
  (table) => ({
    matchIdx: index().on(table.matchId),
    publisherIdx: index().on(table.publisher)
  })
);

export const contests = onchainTable(
  "contests",
  (t) => ({
    id: t.text().primaryKey(),
    contestId: t.bigint().notNull(),
    matchId: t.bigint().notNull(),
    entryFee: t.bigint().notNull(),
    maxEntries: t.integer().notNull(),
    maxEntriesPerWallet: t.integer().notNull(),
    totalEntries: t.integer().default(0).notNull(),
    finalized: t.boolean().default(false).notNull(),
    cancelled: t.boolean().default(false).notNull(),
    prizePool: t.bigint().default(0n).notNull(),
    treasuryFee: t.bigint().default(0n).notNull(),
    operator: t.hex().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    matchIdx: index().on(table.matchId),
    finalizedIdx: index().on(table.finalized),
    cancelledIdx: index().on(table.cancelled)
  })
);

export const contestEntries = onchainTable(
  "contest_entries",
  (t) => ({
    id: t.text().primaryKey(),
    contestId: t.bigint().notNull(),
    matchId: t.bigint().notNull(),
    entryIndex: t.integer().notNull(),
    user: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    passportTokenId: t.bigint().notNull(),
    score: t.integer(),
    joinedAtBlock: t.bigint().notNull(),
    joinedTxHash: t.hex().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    contestIdx: index().on(table.contestId),
    userIdx: index().on(table.user),
    tokenIdx: index().on(table.tokenId)
  })
);

export const contestWinners = onchainTable(
  "contest_winners",
  (t) => ({
    id: t.text().primaryKey(),
    contestId: t.bigint().notNull(),
    matchId: t.bigint().notNull(),
    rank: t.integer().notNull(),
    entryIndex: t.integer().notNull(),
    user: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    score: t.integer().notNull(),
    reward: t.bigint().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    contestIdx: index().on(table.contestId),
    userIdx: index().on(table.user)
  })
);

export const claims = onchainTable(
  "claims",
  (t) => ({
    id: t.text().primaryKey(),
    claimType: t.text().notNull(),
    user: t.hex(),
    treasury: t.hex(),
    claimer: t.hex(),
    amount: t.bigint().notNull(),
    blockNumber: t.bigint().notNull(),
    blockTimestamp: t.bigint().notNull(),
    transactionHash: t.hex().notNull()
  }),
  (table) => ({
    typeIdx: index().on(table.claimType),
    userIdx: index().on(table.user),
    treasuryIdx: index().on(table.treasury)
  })
);

export const contractMetadata = onchainTable(
  "contract_metadata",
  (t) => ({
    id: t.text().primaryKey(),
    contractName: t.text().notNull(),
    baseURI: t.text().notNull(),
    updater: t.hex().notNull(),
    updatedAtBlock: t.bigint().notNull(),
    transactionHash: t.hex().notNull()
  }),
  (table) => ({
    contractIdx: index().on(table.contractName)
  })
);

export const nftTransfers = onchainTable(
  "nft_transfers",
  (t) => ({
    id: t.text().primaryKey(),
    tokenId: t.bigint().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    blockNumber: t.bigint().notNull(),
    blockTimestamp: t.bigint().notNull(),
    transactionHash: t.hex().notNull()
  }),
  (table) => ({
    tokenIdx: index().on(table.tokenId),
    fromIdx: index().on(table.from),
    toIdx: index().on(table.to)
  })
);

export const userBalances = onchainTable(
  "user_balances",
  (t) => ({
    id: t.text().primaryKey(),
    user: t.hex().notNull(),
    claimableReward: t.bigint().default(0n).notNull(),
    refundableAmount: t.bigint().default(0n).notNull(),
    totalRewardsClaimed: t.bigint().default(0n).notNull(),
    totalRefundsClaimed: t.bigint().default(0n).notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    userIdx: index().on(table.user)
  })
);

export const refunds = onchainTable(
  "refunds",
  (t) => ({
    id: t.text().primaryKey(),
    contestId: t.bigint().notNull(),
    matchId: t.bigint().notNull(),
    entryIndex: t.integer().notNull(),
    user: t.hex().notNull(),
    tokenId: t.bigint().notNull(),
    amount: t.bigint().notNull(),
    newRefundableAmount: t.bigint().notNull(),
    updatedAtBlock: t.bigint().notNull()
  }),
  (table) => ({
    contestIdx: index().on(table.contestId),
    userIdx: index().on(table.user)
  })
);

export const treasuryState = onchainTable("treasury_state", (t) => ({
  id: t.text().primaryKey(),
  treasury: t.hex(),
  claimable: t.bigint().default(0n).notNull(),
  totalClaimed: t.bigint().default(0n).notNull(),
  updatedAtBlock: t.bigint().notNull()
}));
