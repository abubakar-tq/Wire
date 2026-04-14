'use client';

import { useEffect, useState } from 'react';
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

export default function Page() {
  const controller = useAppController();
  const [mounted, setMounted] = useState(false);

  // Store controller globally for sidebar demo buttons
  useEffect(() => {
    setMounted(true);
    (window as any).__controller = controller;
  }, [controller]);

  if (!mounted) return null;

  const { state, actions, selectors } = controller;

  const renderView = () => {
    switch (state.activeView) {
      case 'DASHBOARD':
        return <DashboardView state={state} />;
      case 'ARENA':
        return (
          <ArenaView
            availablePlayers={selectors.getAvailablePlayers()}
            squad={state.squad}
            creditsUsed={selectors.getCreditsUsed()}
            isSquadValid={selectors.isSquadValid()}
            matchStatus={state.matchStatus}
            onAddPlayer={actions.addPlayerToSquad}
            onRemovePlayer={actions.removePlayerFromSquad}
            onSetCaptain={actions.setCaptain}
            onSetViceCaptain={actions.setViceCaptain}
          />
        );
      case 'LEADERBOARD':
        return <LeaderboardView state={state} onLiveUpdate={actions.updateLeaderboardPoints} />;
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
      <Navbar state={state} />
      <div className="flex h-[calc(100vh-73px)] flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile, shown on md+ */}
        <div className="hidden md:block md:w-64 lg:w-64 bg-white border-r border-slate-200 overflow-y-auto">
          <Sidebar state={state} onViewChange={actions.setActiveView} />
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
