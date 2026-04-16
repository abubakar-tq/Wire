export const INDEXER_URL =
  process.env.NEXT_PUBLIC_INDEXER_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:42069");
const indexerUrl = INDEXER_URL;

export type HexString = `0x${string}`;

export type IndexedMatch = {
  id: string;
  matchId: string;
  homeTeam: HexString;
  awayTeam: HexString;
  startTime: string;
  lockTime: string;
  status: number;
  operator: HexString;
  playerCount: number;
  contestId: string | null;
  createdTxHash: HexString;
  updatedAtBlock: string;
};

export type IndexedMatchPlayer = {
  id: string;
  matchId: string;
  playerId: number;
  role: number;
  teamSide: number;
  allowed: boolean;
  updatedAtBlock: string;
};

export type IndexedContest = {
  id: string;
  contestId: string;
  matchId: string;
  entryFee: string;
  maxEntries: number;
  maxEntriesPerWallet: number;
  totalEntries: number;
  finalized: boolean;
  cancelled: boolean;
  prizePool: string;
  treasuryFee: string;
  operator: HexString;
  updatedAtBlock: string;
};

export type IndexedContestEntry = {
  id: string;
  contestId: string;
  matchId: string;
  entryIndex: number;
  user: HexString;
  tokenId: string;
  passportTokenId: string;
  score: number | null;
  joinedAtBlock: string;
  joinedTxHash: HexString;
  updatedAtBlock: string;
};

export type IndexedContestWinner = {
  id: string;
  contestId: string;
  matchId: string;
  rank: number;
  entryIndex: number;
  user: HexString;
  tokenId: string;
  score: number;
  reward: string;
  updatedAtBlock: string;
};

export type IndexedTreasury = {
  id: string;
  treasury: HexString | null;
  claimable: string;
  totalClaimed: string;
  updatedAtBlock: string;
};

export type IndexedPassport = {
  id: string;
  user: HexString;
  tokenId: string;
  contestsEntered: number;
  contestsWon: number;
  totalRewardsClaimed: string;
  firstJoinedAt: string;
  lastActiveAt: string;
  mintedAtBlock: string;
  updatedAtBlock: string;
};

export type IndexedBalance = {
  id: string;
  user: HexString;
  claimableReward: string;
  refundableAmount: string;
  totalRewardsClaimed: string;
  totalRefundsClaimed: string;
  updatedAtBlock: string;
};

export type IndexedAuditEvent = {
  id: string;
  contractName: string;
  eventName: string;
  chainId: number;
  blockNumber: string;
  blockTimestamp: string;
  logIndex: number;
  transactionHash: HexString;
  contractAddress: HexString;
  args: Record<string, unknown>;
};

export type IndexerSummary = {
  recentMatches: IndexedMatch[];
  recentContests: IndexedContest[];
  treasury: IndexedTreasury | null;
  recentClaims?: unknown[];
  metadata?: unknown[];
};

export type IndexerHealth = {
  ok: boolean;
  service: string;
  latestBlock: string | null;
  latestEvent: {
    contractName: string;
    eventName: string;
    blockNumber: string;
    transactionHash: HexString;
  } | null;
};

export async function indexerGraphql<TData>(
  query: string,
  variables?: Record<string, unknown>,
  init?: RequestInit
): Promise<TData> {
  const response = await fetch(`${indexerUrl}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...init?.headers
    },
    body: JSON.stringify({ query, variables }),
    ...init
  });

  if (!response.ok) {
    throw new Error(`Indexer GraphQL request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { data?: TData; errors?: unknown[] };
  if (payload.errors?.length) {
    throw new Error("Indexer GraphQL returned errors");
  }

  if (!payload.data) {
    throw new Error("Indexer GraphQL returned no data");
  }

  return payload.data;
}

export async function getIndexerSummary(init?: RequestInit): Promise<IndexerSummary> {
  return getIndexerJson<IndexerSummary>("/summary", init);
}

export async function getIndexerHealth(init?: RequestInit): Promise<IndexerHealth> {
  return getIndexerJson<IndexerHealth>("/healthz", init);
}

export async function getMatches(init?: RequestInit): Promise<IndexedMatch[]> {
  return getIndexerJson<IndexedMatch[]>("/matches", init);
}

export async function getMatch(matchId: string | bigint, init?: RequestInit) {
  return getIndexerJson<{
    match: IndexedMatch;
    players: IndexedMatchPlayer[];
    stats: unknown[];
    scoreSubmission: unknown | null;
    contest: IndexedContest | null;
  }>(`/matches/${matchId.toString()}`, init);
}

export async function getMatchPlayers(matchId: string | bigint, init?: RequestInit): Promise<IndexedMatchPlayer[]> {
  return getIndexerJson<IndexedMatchPlayer[]>(`/matches/${matchId.toString()}/players`, init);
}

export async function getContests(init?: RequestInit): Promise<IndexedContest[]> {
  return getIndexerJson<IndexedContest[]>("/contests", init);
}

export async function getContest(contestId: string | bigint, init?: RequestInit) {
  return getIndexerJson<{
    contest: IndexedContest;
    entries: IndexedContestEntry[];
    winners: IndexedContestWinner[];
    refunds: unknown[];
  }>(`/contests/${contestId.toString()}`, init);
}

export async function getLeaderboard(contestId?: string | bigint, init?: RequestInit) {
  const query = contestId ? `?contestId=${contestId.toString()}` : "";
  return getIndexerJson<Array<IndexedContestEntry | IndexedContestWinner>>(`/leaderboard${query}`, init);
}

export async function getUserPassport(address: HexString, init?: RequestInit) {
  return getIndexerJson<{ passport: IndexedPassport | null; balance: IndexedBalance | null }>(
    `/users/${address}/passport`,
    init
  );
}

export async function getUserBalances(address: HexString, init?: RequestInit) {
  return getIndexerJson<IndexedBalance | null>(`/users/${address}/balances`, init);
}

export async function getAuditEvents(init?: RequestInit): Promise<IndexedAuditEvent[]> {
  return getIndexerJson<IndexedAuditEvent[]>("/audit-events", init);
}

async function getIndexerJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!indexerUrl) {
    throw new Error("Indexer URL is not configured. Set NEXT_PUBLIC_INDEXER_URL.");
  }
  const response = await fetch(`${indexerUrl}${path}`, init);
  if (!response.ok) {
    throw new Error(`Indexer request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}
