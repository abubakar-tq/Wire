"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  getAuditEvents,
  getContest,
  getContests,
  getIndexerSummary,
  getLeaderboard,
  getMatch,
  getMatches,
  getUserPassport,
  type HexString
} from "./indexerClient";

export const indexerKeys = {
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

export function useIndexerSummary() {
  return useQuery({
    queryKey: indexerKeys.summary,
    queryFn: () => getIndexerSummary({ cache: "no-store" }),
    refetchInterval: 10_000
  });
}

export function useIndexedMatches() {
  return useQuery({
    queryKey: indexerKeys.matches,
    queryFn: () => getMatches({ cache: "no-store" }),
    refetchInterval: 10_000
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

export function useIndexedContests() {
  return useQuery({
    queryKey: indexerKeys.contests,
    queryFn: () => getContests({ cache: "no-store" }),
    refetchInterval: 10_000
  });
}

export function useIndexedContest(contestId: string | bigint | null | undefined) {
  return useQuery({
    queryKey: indexerKeys.contest(contestId),
    queryFn: () => getContest(contestId ?? "0", { cache: "no-store" }),
    enabled: Boolean(contestId),
    refetchInterval: 10_000
  });
}

export function useIndexedLeaderboard(contestId: string | bigint | null | undefined) {
  return useQuery({
    queryKey: indexerKeys.leaderboard(contestId),
    queryFn: () => getLeaderboard(contestId ?? undefined, { cache: "no-store" }),
    refetchInterval: 10_000
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
