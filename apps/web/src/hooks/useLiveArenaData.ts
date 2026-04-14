"use client";

import { useMemo } from "react";
import type { IndexedContest } from "@/api/indexerClient";
import { useIndexedContest, useIndexedContests, useIndexedLeaderboard, useIndexedMatch } from "@/api/useIndexerData";
import { CRICKET_PLAYERS, MOCK_LEADERBOARD } from "@/lib/mock-data";
import type { CricketPlayer, LeaderboardEntry } from "@/types/index";
import { roleLabel, safePlayerName, teamCodeFromBytes, teamSideLabel } from "@/utils/arenaFormat";

export function useLiveArenaData() {
  const contestsQuery = useIndexedContests();
  const selectedContest = useMemo(() => selectContest(contestsQuery.data ?? []), [contestsQuery.data]);
  const matchQuery = useIndexedMatch(selectedContest?.matchId);
  const contestQuery = useIndexedContest(selectedContest?.contestId);
  const leaderboardQuery = useIndexedLeaderboard(selectedContest?.contestId);

  const availablePlayers = useMemo<CricketPlayer[]>(() => {
    const match = matchQuery.data?.match;
    const players = matchQuery.data?.players ?? [];
    if (!match || players.length === 0) return CRICKET_PLAYERS;

    const homeTeam = teamCodeFromBytes(match.homeTeam, "HOME");
    const awayTeam = teamCodeFromBytes(match.awayTeam, "AWAY");

    return players.map((player) => ({
      id: player.playerId.toString(),
      chainPlayerId: player.playerId,
      name: safePlayerName(player.playerId),
      team: player.teamSide === 1 ? homeTeam : player.teamSide === 2 ? awayTeam : teamSideLabel(player.teamSide),
      role: roleLabel(player.role) as CricketPlayer["role"],
      credits: 9,
      selPct: 0,
      fantasyPoints: 0
    }));
  }, [matchQuery.data]);

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const rows = leaderboardQuery.data ?? [];
    if (rows.length === 0) return MOCK_LEADERBOARD;

    return rows
      .map((row, index) => {
        const maybeEntry = row as { user?: string; score?: number | null; tokenId?: string; rank?: number };
        return {
          rank: maybeEntry.rank ?? index + 1,
          userId: maybeEntry.user ?? `entry-${index}`,
          userName: maybeEntry.user ? `${maybeEntry.user.slice(0, 6)}...${maybeEntry.user.slice(-4)}` : `Entry ${index + 1}`,
          squadName: maybeEntry.tokenId ? `Squad #${maybeEntry.tokenId}` : `Entry ${index + 1}`,
          totalPoints: maybeEntry.score ?? 0,
          change: 0,
          isCurrentUser: false
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [leaderboardQuery.data]);

  return {
    selectedContest,
    selectedMatch: matchQuery.data?.match ?? null,
    contestDetail: contestQuery.data ?? null,
    availablePlayers,
    leaderboard,
    isLoading: contestsQuery.isLoading || matchQuery.isLoading || contestQuery.isLoading,
    hasLiveData: Boolean(selectedContest && matchQuery.data)
  };
}

function selectContest(contests: IndexedContest[]): IndexedContest | null {
  return contests.find((contest) => !contest.finalized && !contest.cancelled) ?? contests[0] ?? null;
}
