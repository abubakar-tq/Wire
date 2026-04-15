"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { matchRegistryAbi } from "@wirefluid/contracts";
import { contractAddresses, contractsConfigured } from "@/contracts/addresses";
import { configuredChainId } from "@/chains/wireFluidTestnet";
import { zeroAddress, zeroHash } from "viem";
import {
  getAuditEvents,
  getContest,
  getContests,
  getIndexerHealth,
  getIndexerSummary,
  getLeaderboard,
  getMatch,
  getMatches,
  getUserPassport,
  type HexString,
  type IndexedMatch,
  type IndexedMatchPlayer
} from "./indexerClient";

export const indexerKeys = {
  health: ["indexer", "health"] as const,
  summary: ["indexer", "summary"] as const,
  matches: ["indexer", "matches"] as const,
  match: (matchId: string | bigint | null | undefined) => ["indexer", "match", matchId?.toString()] as const,
  contests: ["indexer", "contests"] as const,
  contest: (contestId: string | bigint | null | undefined) => ["indexer", "contest", contestId?.toString()] as const,
  leaderboard: (contestId: string | bigint | null | undefined) =>
    ["indexer", "leaderboard", contestId?.toString()] as const,
  user: (address: string | undefined) => ["indexer", "user", address] as const,
  auditEvents: ["indexer", "audit-events"] as const
};

export function useIndexerHealth() {
  return useQuery({
    queryKey: indexerKeys.health,
    queryFn: () => getIndexerHealth({ cache: "no-store" }),
    refetchInterval: 5_000,
    retry: 1
  });
}

export function useIndexerSummary() {
  return useQuery({
    queryKey: indexerKeys.summary,
    queryFn: () => getIndexerSummary({ cache: "no-store" }),
    refetchInterval: 3_000
  });
}

export function useIndexedMatches() {
  return useQuery({
    queryKey: indexerKeys.matches,
    queryFn: () => getMatches({ cache: "no-store" }),
    refetchInterval: 3_000
  });
}

export function useIndexedMatch(matchId: string | bigint | null | undefined) {
  return useQuery({
    queryKey: indexerKeys.match(matchId),
    queryFn: () => getMatch(matchId ?? "0", { cache: "no-store" }),
    enabled: Boolean(matchId),
    refetchInterval: 10_000
  });
}

export function useMatchData(matchId: string | bigint | null | undefined) {
  const indexerQuery = useIndexedMatch(matchId);
  const publicClient = usePublicClient({ chainId: configuredChainId });
  const onchainQuery = useQuery({
    queryKey: ["onchain", "match", matchId?.toString()],
    enabled: Boolean(matchId) && Boolean(publicClient) && contractsConfigured && (indexerQuery.isError || !indexerQuery.data),
    queryFn: async () => {
      if (!matchId || !publicClient) throw new Error("Missing match query context");
      const matchIdValue = typeof matchId === "bigint" ? matchId : BigInt(matchId);

      const matchInfo = (await publicClient.readContract({
        address: contractAddresses.matchRegistry,
        abi: matchRegistryAbi,
        functionName: "getMatch",
        args: [matchIdValue]
      })) as {
        startTime: bigint;
        lockTime: bigint;
        status: number | bigint;
        homeTeam: HexString;
        awayTeam: HexString;
        exists: boolean;
      };

      const playerIds = (await publicClient.readContract({
        address: contractAddresses.matchRegistry,
        abi: matchRegistryAbi,
        functionName: "getMatchPlayerIds",
        args: [matchIdValue]
      })) as ReadonlyArray<number | bigint>;

      const playersMeta = await Promise.all(
        playerIds.map((playerId) =>
          publicClient.readContract({
            address: contractAddresses.matchRegistry,
            abi: matchRegistryAbi,
            functionName: "getPlayerMeta",
            args: [matchIdValue, Number(playerId)]
          })
        )
      );

      const players: IndexedMatchPlayer[] = playersMeta.map((meta) => {
        const parsed = meta as { playerId: number | bigint; role: number | bigint; teamSide: number | bigint; allowed: boolean };
        const playerId = Number(parsed.playerId);
        return {
          id: `${matchIdValue.toString()}-${playerId}`,
          matchId: matchIdValue.toString(),
          playerId,
          role: Number(parsed.role),
          teamSide: Number(parsed.teamSide),
          allowed: Boolean(parsed.allowed),
          updatedAtBlock: "0"
        };
      });

      const match: IndexedMatch = {
        id: matchIdValue.toString(),
        matchId: matchIdValue.toString(),
        homeTeam: matchInfo.homeTeam,
        awayTeam: matchInfo.awayTeam,
        startTime: matchInfo.startTime.toString(),
        lockTime: matchInfo.lockTime.toString(),
        status: Number(matchInfo.status),
        operator: zeroAddress,
        playerCount: players.length,
        contestId: null,
        createdTxHash: zeroHash,
        updatedAtBlock: "0"
      };

      return {
        match,
        players,
        stats: [],
        scoreSubmission: null,
        contest: null
      };
    },
    refetchInterval: 10_000
  });

  const data = indexerQuery.data ?? onchainQuery.data;
  return {
    ...indexerQuery,
    data,
    isLoading: indexerQuery.isLoading || onchainQuery.isLoading,
    isError: indexerQuery.isError && onchainQuery.isError,
    error: indexerQuery.error ?? onchainQuery.error
  };
}

export function useIndexedContests() {
  return useQuery({
    queryKey: indexerKeys.contests,
    queryFn: () => getContests({ cache: "no-store" }),
    refetchInterval: 3_000
  });
}

export function useIndexedContest(contestId: string | bigint | null | undefined) {
  return useQuery({
    queryKey: indexerKeys.contest(contestId),
    queryFn: () => getContest(contestId ?? "0", { cache: "no-store" }),
    enabled: Boolean(contestId),
    refetchInterval: 3_000
  });
}

export function useIndexedLeaderboard(contestId: string | bigint | null | undefined) {
  return useQuery({
    queryKey: indexerKeys.leaderboard(contestId),
    queryFn: () => getLeaderboard(contestId ?? undefined, { cache: "no-store" }),
    refetchInterval: 3_000
  });
}

export function useCurrentUserPassport() {
  const { address } = useAccount();
  return useQuery({
    queryKey: indexerKeys.user(address),
    queryFn: () => getUserPassport(address as HexString, { cache: "no-store" }),
    enabled: Boolean(address),
    refetchInterval: 10_000
  });
}

export function useAuditEvents() {
  return useQuery({
    queryKey: indexerKeys.auditEvents,
    queryFn: () => getAuditEvents({ cache: "no-store" }),
    refetchInterval: 10_000
  });
}
