'use client';

import { useState, useCallback } from 'react';
import { AppState, ViewType, CricketPlayer } from '@/types/index';

export function useAppController() {
  const [state, setState] = useState<AppState>({
    activeView: 'LEADERBOARD',
    userRole: 'PLAYER',
    squad: {
      players: [],
      captainId: null,
      viceCaptainId: null,
    },
    wireBalance: 0,
    matchStatus: 'LIVE',
    livePointsTick: 0,
    leaderboard: [],
    selectedPlayerId: null,
  });

  // Add player to squad
  const addPlayerToSquad = useCallback(
    (player: CricketPlayer) => {
      setState((prev) => {
        if (prev.squad.players.length >= 11) return prev;

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
    return [];
  }, []);

  // Validate squad
  const isSquadValid = useCallback(() => {
    return (
      state.squad.players.length === 11 &&
      state.squad.captainId !== null &&
      state.squad.viceCaptainId !== null &&
      state.squad.captainId !== state.squad.viceCaptainId
    );
  }, [state.squad]);

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
      isSquadValid,
    },
  };
}
