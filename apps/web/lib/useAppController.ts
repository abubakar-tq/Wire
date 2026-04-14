'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppState, Squad, ViewType, CricketPlayer, LeaderboardEntry } from '@/types/index';
import { CRICKET_PLAYERS, MOCK_LEADERBOARD } from './mock-data';

export function useAppController() {
  const [state, setState] = useState<AppState>({
    activeView: 'LEADERBOARD',
    userRole: 'PLAYER',
    squad: {
      players: [],
      captainId: null,
      viceCaptainId: null,
    },
    wireBalance: 2450,
    matchStatus: 'LIVE',
    livePointsTick: 0,
    leaderboard: MOCK_LEADERBOARD,
    selectedPlayerId: null,
  });

  // Add player to squad
  const addPlayerToSquad = useCallback(
    (player: CricketPlayer) => {
      setState((prev) => {
        if (prev.squad.players.length >= 11) return prev;

        const totalCredits = prev.squad.players.reduce((sum, p) => sum + p.credits, 0);
        if (totalCredits + player.credits > 100) return prev;

        if (prev.squad.players.some((p) => p.id === player.id)) return prev;

        return {
          ...prev,
          squad: {
            ...prev.squad,
            players: [...prev.squad.players, { ...player, fantasyPoints: 0 }],
          },
        };
      });
    },
    []
  );

  // Remove player from squad
  const removePlayerFromSquad = useCallback((playerId: string) => {
    setState((prev) => ({
      ...prev,
      squad: {
        ...prev.squad,
        players: prev.squad.players.filter((p) => p.id !== playerId),
        captainId: prev.squad.captainId === playerId ? null : prev.squad.captainId,
        viceCaptainId: prev.squad.viceCaptainId === playerId ? null : prev.squad.viceCaptainId,
      },
    }));
  }, []);

  // Set captain
  const setCaptain = useCallback((playerId: string) => {
    setState((prev) => ({
      ...prev,
      squad: {
        ...prev.squad,
        captainId: prev.squad.captainId === playerId ? null : playerId,
      },
    }));
  }, []);

  // Set vice captain
  const setViceCaptain = useCallback((playerId: string) => {
    setState((prev) => ({
      ...prev,
      squad: {
        ...prev.squad,
        viceCaptainId: prev.squad.viceCaptainId === playerId ? null : playerId,
      },
    }));
  }, []);

  // Change active view
  const setActiveView = useCallback((view: ViewType) => {
    setState((prev) => ({ ...prev, activeView: view }));
  }, []);

  // Set user role
  const setUserRole = useCallback((role: 'PLAYER' | 'ADMIN') => {
    setState((prev) => ({ ...prev, userRole: role }));
  }, []);

  // Add points to leaderboard
  const updateLeaderboardPoints = useCallback(() => {
    setState((prev) => ({
      ...prev,
      leaderboard: prev.leaderboard.map((entry) => {
        if (Math.random() > 0.3) {
          const pointsGain = Math.floor(Math.random() * 6) + 1;
          return {
            ...entry,
            totalPoints: entry.totalPoints + pointsGain,
          };
        }
        return entry;
      }),
      livePointsTick: prev.livePointsTick + 1,
    }));
  }, []);

  // Update player fantasy points
  const updatePlayerPoints = useCallback((playerId: string, points: number) => {
    setState((prev) => ({
      ...prev,
      squad: {
        ...prev.squad,
        players: prev.squad.players.map((p) =>
          p.id === playerId ? { ...p, fantasyPoints: points } : p
        ),
      },
    }));
  }, []);

  // Update wire balance
  const updateWireBalance = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      wireBalance: Math.max(0, prev.wireBalance + amount),
    }));
  }, []);

  // Set match status
  const setMatchStatus = useCallback((status: 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINALIZED') => {
    setState((prev) => ({ ...prev, matchStatus: status }));
  }, []);

  // Get available players
  const getAvailablePlayers = useCallback(() => {
    const selectedIds = new Set(state.squad.players.map((p) => p.id));
    return CRICKET_PLAYERS.filter((p) => !selectedIds.has(p.id));
  }, [state.squad.players]);

  // Calculate squad credits used
  const getCreditsUsed = useCallback(() => {
    return state.squad.players.reduce((sum, p) => sum + p.credits, 0);
  }, [state.squad.players]);

  // Validate squad
  const isSquadValid = useCallback(() => {
    return (
      state.squad.players.length === 11 &&
      getCreditsUsed() <= 100 &&
      state.squad.captainId !== null &&
      state.squad.viceCaptainId !== null &&
      state.squad.captainId !== state.squad.viceCaptainId
    );
  }, [state.squad, getCreditsUsed]);

  return {
    state,
    actions: {
      addPlayerToSquad,
      removePlayerFromSquad,
      setCaptain,
      setViceCaptain,
      setActiveView,
      setUserRole,
      updateLeaderboardPoints,
      updatePlayerPoints,
      updateWireBalance,
      setMatchStatus,
    },
    selectors: {
      getAvailablePlayers,
      getCreditsUsed,
      isSquadValid,
    },
  };
}
