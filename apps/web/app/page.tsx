'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useChainId, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { WIREFLUID_TESTNET_CHAIN_ID, contestManagerAbi } from '@wirefluid/contracts';
import { useAppController } from '@/lib/useAppController';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LeaderboardView } from '@/components/views/LeaderboardView';
import { ArenaView } from '@/components/views/ArenaView';
import { RewardsView } from '@/components/views/RewardsView';
import { AdminScoreView } from '@/components/views/AdminScoreView';
import { AdminDashboardView } from '@/components/views/AdminDashboardView';
import { DashboardView } from '@/components/views/DashboardView';
import { ProtocolView, MatchView, TreasuryView } from '@/components/views/AdminStubViews';
import { useLiveArenaData } from '@/hooks/useLiveArenaData';
import { indexerKeys } from '@/api/useIndexerData';
import { contractAddresses, contractsConfigured } from '@/contracts/addresses';
import { toUint16Array11 } from '@/utils/arenaFormat';
import { useRoleChecks } from '@/web3/useRoleChecks';
import type { HexString } from '@/api/indexerClient';

export default function Page() {
  const controller = useAppController();
  const [mounted, setMounted] = useState(false);
  const [txHash, setTxHash] = useState<HexString | undefined>();
  const [joinError, setJoinError] = useState<string | undefined>();
  const live = useLiveArenaData();
  const roles = useRoleChecks();
  const { address } = useAccount();
  const chainId = useChainId();
  const queryClient = useQueryClient();
  const { writeContractAsync, status: writeStatus, error: writeError } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: txHash });

  // Store controller globally for sidebar demo buttons
  useEffect(() => {
    setMounted(true);
    (window as any).__controller = controller;
  }, [controller]);

  useEffect(() => {
    if (!receipt.isSuccess) return;
    void queryClient.invalidateQueries({ queryKey: indexerKeys.contests });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.contest(live.selectedContest?.contestId) });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.leaderboard(live.selectedContest?.contestId) });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.user(address) });
  }, [address, live.selectedContest?.contestId, queryClient, receipt.isSuccess]);

  if (!mounted) return null;

  const { state, actions, selectors } = controller;
  const isAdmin = roles.admin || roles.operator || roles.scorePublisher || roles.treasury;
  const effectiveState = {
    ...state,
    userRole: isAdmin ? 'ADMIN' as const : 'PLAYER' as const,
    leaderboard: live.leaderboard,
    matchStatus:
      live.selectedMatch?.status === 1
        ? 'LOCKED' as const
        : live.selectedMatch?.status === 3
          ? 'FINALIZED' as const
          : state.matchStatus
  };
  const selectedIds = new Set(state.squad.players.map((player) => player.id));
  const availablePlayers = live.availablePlayers.filter((player) => !selectedIds.has(player.id));

  const joinContest = async () => {
    setJoinError(undefined);
    if (!live.selectedContest) throw new Error('No open contest is available');
    if (!contractsConfigured) {
      setJoinError('Contract addresses are not configured');
      throw new Error('Contract addresses are not configured');
    }
    if (chainId !== WIREFLUID_TESTNET_CHAIN_ID) {
      setJoinError('Switch to WireFluid Testnet');
      throw new Error('Switch to WireFluid Testnet');
    }

    const playerIds = toUint16Array11(
      state.squad.players.map((player) => player.chainPlayerId ?? Number(player.id))
    );
    const captain = state.squad.players.find((player) => player.id === state.squad.captainId);
    const viceCaptain = state.squad.players.find((player) => player.id === state.squad.viceCaptainId);
    if (!captain || !viceCaptain) throw new Error('Captain and vice-captain are required');

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
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : 'Join transaction failed');
      throw error;
    }
  };

  const renderView = () => {
    switch (effectiveState.activeView) {
      case 'DASHBOARD':
        return <DashboardView state={effectiveState} />;
      case 'ARENA':
        return (
          <ArenaView
            availablePlayers={live.hasLiveData ? availablePlayers : selectors.getAvailablePlayers()}
            squad={state.squad}
            creditsUsed={selectors.getCreditsUsed()}
            isSquadValid={selectors.isSquadValid()}
            matchStatus={effectiveState.matchStatus}
            selectedContest={live.selectedContest}
            onJoinContest={joinContest}
            isJoining={writeStatus === 'pending' || receipt.status === 'pending'}
            txHash={txHash}
            txError={joinError ?? writeError?.message ?? receipt.error?.message}
            onAddPlayer={actions.addPlayerToSquad}
            onRemovePlayer={actions.removePlayerFromSquad}
            onSetCaptain={actions.setCaptain}
            onSetViceCaptain={actions.setViceCaptain}
          />
        );
      case 'LEADERBOARD':
        return <LeaderboardView state={effectiveState} onLiveUpdate={actions.updateLeaderboardPoints} />;
      case 'REWARDS':
        return <RewardsView wireBalance={state.wireBalance} onClaimRewards={actions.updateWireBalance} />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboardView />;
      case 'PROTOCOL':
        return <ProtocolView />;
      case 'MATCH':
        return <MatchView />;
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
      <Navbar state={effectiveState} roles={roles} />
      <div className="flex h-[calc(100vh-73px)] flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <div className="hidden md:block md:w-64 lg:w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <Sidebar state={effectiveState} onViewChange={actions.setActiveView} hasAdminAccess={isAdmin} />
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
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
