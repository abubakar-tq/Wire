"use client";

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Menu, ShieldCheck, Zap } from 'lucide-react';
import { useAccount, useSwitchChain, useWalletClient } from 'wagmi';
import type { AppState, ViewType } from '@/types/index';
import type { RoleChecks } from '@/web3/useRoleChecks';
import { shortAddress } from '@/utils/arenaFormat';
import { useSiweSession } from '@/auth/useSiweSession';
import { configuredChainId, wireFluidTestnet } from '@/chains/wireFluidTestnet';

interface NavbarProps {
  state: AppState;
  roles: RoleChecks;
  onViewChange: (view: ViewType) => void;
  onOpenMobileMenu?: () => void;
}

const PLAYER_VIEWS: Array<{ label: string; view: ViewType }> = [
  { label: 'Dashboard', view: 'DASHBOARD' },
  { label: 'Matches', view: 'ARENA' },
  { label: 'Leaderboard', view: 'LEADERBOARD' },
  { label: 'Rewards', view: 'REWARDS' }
];

export function Navbar({ state, roles, onViewChange, onOpenMobileMenu }: NavbarProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const auth = useSiweSession();
  const { isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();

  const hasAdminAccess = roles.admin || roles.operator || roles.scorePublisher || roles.treasury;
  const showAdminEntry = isConnected && (hasAdminAccess || !roles.ready);

  const openAdmin = async () => {
    setAuthError(null);
    try {
      if (!auth.authenticated) {
        await auth.signIn();
      }
      onViewChange('ADMIN_DASHBOARD');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Admin verification failed');
    }
  };


  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            {onOpenMobileMenu ? (
              <button
                onClick={onOpenMobileMenu}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </button>
            ) : null}
            <button
              onClick={() => onViewChange('DASHBOARD')}
              className="flex min-w-0 items-center gap-2 text-slate-900"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Zap className="w-4 h-4" />
              </div>
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm font-bold leading-tight">WireFluid Arena</p>
                <p className="truncate text-[11px] leading-tight text-slate-500">Fantasy Cricket</p>
              </div>
            </button>
          </div>

          <nav className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {!hasAdminAccess && PLAYER_VIEWS.map((item) => (
              <button
                key={item.view}
                onClick={() => onViewChange(item.view)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  state.activeView === item.view
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
            {showAdminEntry ? (
              <button
                onClick={openAdmin}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  ['ADMIN_DASHBOARD', 'PROTOCOL', 'MATCH', 'PLAYERS', 'SCORE', 'TREASURY'].includes(state.activeView)
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            ) : null}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            {hasAdminAccess && auth.authenticated ? (
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin verified
              </div>
            ) : null}

            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                
                if (!connected) {
                  return (
                    <button 
                      onClick={openConnectModal} 
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-3.5"
                    >
                      <span className="sm:hidden">Connect</span>
                      <span className="hidden sm:inline">Connect Wallet</span>
                    </button>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 sm:px-3.5"
                    >
                      <span className="sm:hidden">Network</span>
                      <span className="hidden sm:inline">Wrong Network</span>
                    </button>
                  );
                }

                return (
                  <button
                    onClick={openAccountModal}
                    className="flex max-w-[42vw] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 hover:shadow-sm sm:max-w-none sm:px-3.5"
                  >
                    <div className="size-2 shrink-0 rounded-full bg-emerald-500"></div>
                    <span className="truncate">{shortAddress(account.address)}</span>
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {showAdminEntry ? (
          <div className="mt-3 flex items-center justify-between gap-3 md:hidden">
            <button
              onClick={openAdmin}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
            >
              Admin
            </button>
          </div>
        ) : null}

        {authError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{authError}</div>
        ) : null}
      </div>
    </header>
  );
}
