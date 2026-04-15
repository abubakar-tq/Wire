"use client";

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { contestManagerAbi } from '@wirefluid/contracts';
import { useAppController } from '@/lib/useAppController';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { ArenaView } from '@/components/views/ArenaView';
import { RewardsView } from '@/components/views/RewardsView';
import { AdminScoreView } from '@/components/views/AdminScoreView';
import { AdminDashboardView } from '@/components/views/AdminDashboardView';
import { DashboardView } from '@/components/views/DashboardView';
import { ProtocolView, MatchView, PlayerDatabaseView, TreasuryView } from '@/components/views/AdminStubViews';
import { useLiveArenaData } from '@/hooks/useLiveArenaData';
import { indexerKeys } from '@/api/useIndexerData';
import { contractAddresses, contractsConfigured } from '@/contracts/addresses';
import { configuredChainId } from '@/chains/wireFluidTestnet';
import { toUint16Array11 } from '@/utils/arenaFormat';
import { normalizeContractError } from '@/utils/contractErrors';
import { useRoleChecks } from '@/web3/useRoleChecks';
import { useSiweSession } from '@/auth/useSiweSession';
import type { HexString } from '@/api/indexerClient';
import type { CricketPlayer, Squad } from '@/types/index';

const EMPTY_SQUAD: Squad = {
  players: [],
  captainId: null,
  viceCaptainId: null
};

function getSquadValidationError(squad: Squad): string | null {
  if (squad.players.length !== 11) return "Select exactly 11 players.";
  if (!squad.captainId) return "Select a captain.";
  if (!squad.viceCaptainId) return "Select a vice captain.";
  if (squad.captainId === squad.viceCaptainId) return "Captain and vice captain must be different players.";

  const roleCounts = squad.players.reduce<Record<string, number>>((counts, player) => {
    counts[player.role] = (counts[player.role] ?? 0) + 1;
    return counts;
  }, {});
  const teamCounts = squad.players.reduce<Record<string, number>>((counts, player) => {
    counts[player.team] = (counts[player.team] ?? 0) + 1;
    return counts;
  }, {});

  if ((roleCounts.WK ?? 0) < 1 || (roleCounts.WK ?? 0) > 4) return "Squad needs 1-4 wicket keepers.";
  if ((roleCounts.BAT ?? 0) < 3 || (roleCounts.BAT ?? 0) > 6) return "Squad needs 3-6 batters.";
  if ((roleCounts.AR ?? 0) < 1 || (roleCounts.AR ?? 0) > 4) return "Squad needs 1-4 all-rounders.";
  if ((roleCounts.BOWL ?? 0) < 3 || (roleCounts.BOWL ?? 0) > 6) return "Squad needs 3-6 bowlers.";
  if (Object.values(teamCounts).some((count) => count > 7)) return "Use no more than 7 players from one team.";

  return null;
}

type SquadComposition = {
  roles: { WK: number; BAT: number; AR: number; BOWL: number };
  teams: Array<{ team: string; count: number }>;
};

function getSquadComposition(squad: Squad): SquadComposition {
  const roles = squad.players.reduce<SquadComposition["roles"]>(
    (counts, player) => {
      counts[player.role] += 1;
      return counts;
    },
    { WK: 0, BAT: 0, AR: 0, BOWL: 0 }
  );

  const teamCounts = squad.players.reduce<Record<string, number>>((counts, player) => {
    counts[player.team] = (counts[player.team] ?? 0) + 1;
    return counts;
  }, {});

  const teams = Object.entries(teamCounts)
    .sort(([teamA], [teamB]) => teamA.localeCompare(teamB))
    .map(([team, count]) => ({ team, count }));

  return { roles, teams };
}

export default function Page() {
  const controller = useAppController();
  const [txHash, setTxHash] = useState<HexString | undefined>();
  const [joinError, setJoinError] = useState<string | undefined>();
  const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);
  const [squadsByMatch, setSquadsByMatch] = useState<Record<string, Squad>>({});
  const [selectedContestId, setSelectedContestId] = useState<string | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const live = useLiveArenaData(selectedContestId);
  const roles = useRoleChecks();
  const auth = useSiweSession();
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { writeContractAsync, error: writeError } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: txHash });
  const wrongChain = Boolean(address && chainId !== configuredChainId);

  useEffect(() => {
    if (!receipt.isSuccess) return;
    void queryClient.invalidateQueries({ queryKey: indexerKeys.contests });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.contest(live.selectedContest?.contestId) });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.leaderboard(live.selectedContest?.contestId) });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.user(address) });
  }, [address, live.selectedContest?.contestId, queryClient, receipt.isSuccess]);

  const { state, actions } = controller;
  const activeMatchId = (live.selectedContest?.matchId ?? live.selectedMatch?.matchId ?? 'default').toString();
  const activeSquad = squadsByMatch[activeMatchId] ?? EMPTY_SQUAD;

  const updateActiveSquad = useCallback((updater: (squad: Squad) => Squad) => {
    setSquadsByMatch((prev) => ({
      ...prev,
      [activeMatchId]: updater(prev[activeMatchId] ?? EMPTY_SQUAD)
    }));
  }, [activeMatchId]);

  const addPlayerToMatchSquad = useCallback((player: CricketPlayer) => {
    updateActiveSquad((current) => {
      if (current.players.length >= 11) return current;
      if (current.players.some((p) => p.id === player.id)) return current;

      return {
        ...current,
        players: [...current.players, { ...player, fantasyPoints: 0 }]
      };
    });
  }, [updateActiveSquad]);

  const removePlayerFromMatchSquad = useCallback((playerId: string) => {
    updateActiveSquad((current) => ({
      ...current,
      players: current.players.filter((p) => p.id !== playerId),
      captainId: current.captainId === playerId ? null : current.captainId,
      viceCaptainId: current.viceCaptainId === playerId ? null : current.viceCaptainId
    }));
  }, [updateActiveSquad]);

  const setMatchCaptain = useCallback((playerId: string) => {
    updateActiveSquad((current) => ({
      ...current,
      captainId: current.captainId === playerId ? null : playerId
    }));
  }, [updateActiveSquad]);

  const setMatchViceCaptain = useCallback((playerId: string) => {
    updateActiveSquad((current) => ({
      ...current,
      viceCaptainId: current.viceCaptainId === playerId ? null : playerId
    }));
  }, [updateActiveSquad]);

  const clearMatchSquad = useCallback(() => {
    setSquadsByMatch((prev) => ({
      ...prev,
      [activeMatchId]: EMPTY_SQUAD
    }));
  }, [activeMatchId]);

  const squadValidationError = getSquadValidationError(activeSquad);
  const isMatchSquadValid = squadValidationError === null;
  const squadComposition = getSquadComposition(activeSquad);

  const isAdmin = roles.admin || roles.operator || roles.scorePublisher || roles.treasury || auth.authenticated;
  const effectiveState = {
    ...state,
    userRole: isAdmin ? 'ADMIN' as const : 'PLAYER' as const,
    squad: activeSquad,
    leaderboard: live.leaderboard,
    matchStatus:
      live.selectedMatch?.status === 1
        ? 'LOCKED' as const
        : live.selectedMatch?.status === 3
          ? 'FINALIZED' as const
          : state.matchStatus
  };
  const selectedIds = new Set(activeSquad.players.map((player) => player.id));
  const availablePlayers = live.availablePlayers.filter((player) => !selectedIds.has(player.id));

  const joinContest = async () => {
    setJoinError(undefined);
    setTxHash(undefined);
    if (!live.selectedContest) throw new Error('No open contest is available');
    if (!contractsConfigured) {
      setJoinError('Contract addresses are not configured');
      throw new Error('Contract addresses are not configured');
    }
    if (chainId !== configuredChainId) {
      setJoinError(`Switch to chain ${configuredChainId}`);
      throw new Error(`Switch to chain ${configuredChainId}`);
    }

    const playerIds = toUint16Array11(activeSquad.players.map((player) => player.chainPlayerId ?? Number(player.id)));
    const captain = activeSquad.players.find((player) => player.id === activeSquad.captainId);
    const viceCaptain = activeSquad.players.find((player) => player.id === activeSquad.viceCaptainId);
    if (!captain || !viceCaptain) throw new Error('Captain and vice-captain are required');

    setIsJoinSubmitting(true);
    try {
      const hash = await writeContractAsync({
        address: contractAddresses.contestManager,
        abi: contestManagerAbi,
        functionName: 'joinContest',
        args: [
          BigInt(live.selectedContest.contestId),
          playerIds,
          captain.chainPlayerId ?? Number(captain.id),
          viceCaptain.chainPlayerId ?? Number(viceCaptain.id)
        ],
        value: BigInt(live.selectedContest.entryFee)
      });
      setTxHash(hash);
      clearMatchSquad();
    } catch (error) {
      setJoinError(normalizeContractError(error));
      throw error;
    } finally {
      setIsJoinSubmitting(false);
    }
  };

  const buildSquadForContest = useCallback((contestId: string) => {
    setSelectedContestId(contestId);
    actions.setActiveView('ARENA');
  }, [actions]);

  const renderView = () => {
    switch (effectiveState.activeView) {
      case 'DASHBOARD':
        return <DashboardView state={effectiveState} onBuildSquad={buildSquadForContest} />;
      case 'ARENA':
        return (
          <ArenaView
            availablePlayers={availablePlayers}
            squad={activeSquad}
            isSquadValid={isMatchSquadValid}
            squadValidationError={squadValidationError}
            squadComposition={squadComposition}
            matchStatus={effectiveState.matchStatus}
            activeMatchId={activeMatchId}
            activeMatchLabel={
              live.selectedMatch
                ? `${live.selectedMatch.matchId}`
                : live.selectedContest
                  ? `${live.selectedContest.matchId}`
                  : undefined
            }
            openContests={(live.contests ?? []).filter(c => !c.finalized && !c.cancelled)}
            onChangeContest={(id: string) => setSelectedContestId(id)}
            selectedContest={live.selectedContest}
            onJoinContest={joinContest}
            isJoining={isJoinSubmitting || Boolean(txHash && receipt.status === 'pending')}
            txHash={txHash}
            txError={
              joinError ??
              (writeError ? normalizeContractError(writeError) : undefined) ??
              (receipt.error ? normalizeContractError(receipt.error) : undefined)
            }
            onAddPlayer={addPlayerToMatchSquad}
            onRemovePlayer={removePlayerFromMatchSquad}
            onSetCaptain={setMatchCaptain}
            onSetViceCaptain={setMatchViceCaptain}
            onClearSquad={clearMatchSquad}
          />
        );
      case 'LEADERBOARD':
        return <LeaderboardView state={effectiveState} onLiveUpdate={actions.updateLeaderboardPoints} />;
      case 'REWARDS':
        return <RewardsView wireBalance={state.wireBalance} onClaimRewards={actions.updateWireBalance} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboardView onViewChange={actions.setActiveView} />;
      case 'PROTOCOL':
        return <ProtocolView />;
      case 'MATCH':
        return <MatchView />;
      case 'PLAYERS':
        return <PlayerDatabaseView />;
      case 'SCORE':
        return <AdminScoreView onUpdateScore={actions.updatePlayerPoints} />;
      case 'TREASURY':
        return <TreasuryView />;
      default:
        return <LeaderboardView state={state} onLiveUpdate={actions.updateLeaderboardPoints} />;
    }
  };

  return (
    <div className="bg-white">
      <Navbar state={effectiveState} roles={roles} onViewChange={actions.setActiveView} />
      {wrongChain ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900">
          Switch your wallet to chain {configuredChainId} before submitting transactions.
        </div>
      ) : null}
      <div className={`flex ${wrongChain ? 'h-[calc(100vh-113px)]' : 'h-[calc(100vh-73px)]'} flex-col md:flex-row`}>
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <div
          className={`hidden md:block bg-white border-r border-slate-200 overflow-y-auto transition-[width] duration-200 ${
            isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
          }`}
        >
          <Sidebar
            state={effectiveState}
            onViewChange={actions.setActiveView}
            hasAdminAccess={isAdmin}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
          />
        </div>
        {/* Main Content */}
        <div className="min-w-0 flex-1 overflow-hidden">
          {renderView()}
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
