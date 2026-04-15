"use client";

import { useMemo } from "react";
import type { IndexedContest } from "@/api/indexerClient";
import { useIndexedContest, useIndexedContests, useIndexedLeaderboard, useMatchData } from "@/api/useIndexerData";
import { usePlayerProfiles } from "@/api/usePlayerProfiles";
import type { CricketPlayer, LeaderboardEntry } from "@/types/index";
import { getPlayerMetadata } from "@/lib/playerMetadata";
import { roleLabel, safePlayerName, teamCodeFromBytes, teamSideLabel } from "@/utils/arenaFormat";

export function useLiveArenaData(selectedContestId?: string) {
  const contestsQuery = useIndexedContests();
  const selectedContest = useMemo(
    () => selectContest(contestsQuery.data ?? [], selectedContestId),
    [contestsQuery.data, selectedContestId]
  );
  const matchQuery = useMatchData(selectedContest?.matchId);
  const contestQuery = useIndexedContest(selectedContest?.contestId);
  const globalLeaderboardQuery = useIndexedLeaderboard(undefined);
  const playerIds = useMemo(
    () => (matchQuery.data?.players ?? []).map((player) => player.playerId),
    [matchQuery.data?.players]
  );
  const profilesQuery = usePlayerProfiles(playerIds);

  const availablePlayers = useMemo<CricketPlayer[]>(() => {
    const match = matchQuery.data?.match;
    const players = matchQuery.data?.players ?? [];
    if (!match || players.length === 0) return [];

    const homeTeam = teamCodeFromBytes(match.homeTeam, "HOME");
    const awayTeam = teamCodeFromBytes(match.awayTeam, "AWAY");

    const profilesById = new Map((profilesQuery.data ?? []).map((profile) => [profile.playerId, profile]));

    return players.map((player) => {
      const metadata = getPlayerMetadata(player.playerId);
      const profile = profilesById.get(player.playerId);
      const teamFromMatch =
        player.teamSide === 1 ? homeTeam : player.teamSide === 2 ? awayTeam : teamSideLabel(player.teamSide);
      const team =
        profile?.teamCode
          ? profile.teamCode
          : metadata?.team && (teamFromMatch === "HOME" || teamFromMatch === "AWAY")
            ? metadata.team
            : teamFromMatch;

      const displayName = profile?.name ?? safePlayerName(player.playerId);
      const imageUrl = profile?.imageUrl ?? metadata?.imageUrl;

      return {
        id: player.playerId.toString(),
        chainPlayerId: player.playerId,
        name: displayName,
        team,
        role: roleLabel(player.role) as CricketPlayer["role"],
        imageUrl,
        credits: 9,
        selPct: 0,
        fantasyPoints: 0
      };
    });
  }, [matchQuery.data, profilesQuery.data]);

  const leaderboard = useMemo<LeaderboardEntry[]>(() => {
    const rows = globalLeaderboardQuery.data ?? [];
    if (rows.length === 0) return [];

    const userMap = new Map<string, { score: number; squads: number; tokenIds: string[] }>();

    for (const row of rows) {
      const maybeEntry = row as { user?: string; score?: number | null; tokenId?: string };
      if (!maybeEntry.user) continue;
      
      const existing = userMap.get(maybeEntry.user) ?? { score: 0, squads: 0, tokenIds: [] };
      const nextTokenIds = [...existing.tokenIds];
      if (maybeEntry.tokenId && !nextTokenIds.includes(maybeEntry.tokenId)) {
        nextTokenIds.push(maybeEntry.tokenId);
      }

      userMap.set(maybeEntry.user, {
        score: existing.score + (maybeEntry.score ?? 0),
        squads: existing.squads + 1,
        tokenIds: nextTokenIds
      });
    }

    return Array.from(userMap.entries())
      .map(([user, data]) => ({
        rank: 0,
        userId: user,
        userName: `${user.slice(0, 6)}...${user.slice(-4)}`,
        squadName: `${data.squads} Squad${data.squads === 1 ? '' : 's'}`,
        tokenIds: data.tokenIds,
        totalPoints: data.score,
        change: 0,
        isCurrentUser: false
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [globalLeaderboardQuery.data]);

  return {
    selectedContest,
    selectedMatch: matchQuery.data?.match ?? null,
    contestDetail: contestQuery.data ?? null,
    contests: contestsQuery.data ?? [],
    availablePlayers,
    leaderboard,
    isLoading: contestsQuery.isLoading || matchQuery.isLoading || contestQuery.isLoading || profilesQuery.isLoading,
    hasLiveData: Boolean(selectedContest && matchQuery.data)
  };
}

function selectContest(contests: IndexedContest[], selectedContestId?: string): IndexedContest | null {
  if (selectedContestId) {
    const selected = contests.find((contest) => contest.contestId === selectedContestId);
    if (selected) return selected;
  }
  return contests.find((contest) => !contest.finalized && !contest.cancelled) ?? contests[0] ?? null;
}
