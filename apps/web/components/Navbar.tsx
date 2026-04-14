'use client';

import { Zap, Bell, Settings } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useChainId } from 'wagmi';
import { WIREFLUID_TESTNET_CHAIN_ID } from '@wirefluid/contracts';
import { useState } from 'react';
import { AppState } from '@/types/index';
import { contractsConfigured } from '@/contracts/addresses';
import { shortAddress } from '@/utils/arenaFormat';
import type { RoleChecks } from '@/web3/useRoleChecks';

interface NavbarProps {
  state: AppState;
  roles: RoleChecks;
}

export function Navbar({ state, roles }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const chainId = useChainId();
  const wrongChain = chainId !== WIREFLUID_TESTNET_CHAIN_ID;
  const roleChips = [
    ['Admin', roles.admin],
    ['Operator', roles.operator],
    ['Score Publisher', roles.scorePublisher],
    ['Treasury', roles.treasury],
  ] as const;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm backdrop-blur-xs">
      {(wrongChain || !contractsConfigured) && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {wrongChain ? 'Switch to WireFluid Testnet before writing transactions.' : 'Contract addresses are not configured.'}
        </div>
      )}
      <div className="px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-9 md:w-10 h-9 md:h-10 bg-teal-600 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-smooth transform hover:scale-105">
            <Zap className="w-5 md:w-6 h-5 md:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">WireFluid</h1>
            <p className="text-xs text-slate-500 font-medium">Arena</p>
          </div>
        </div>

        {/* Center: Match Ticker */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-smooth group flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full group-hover:scale-125 transition-smooth ${wrongChain ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            <span className="text-sm font-semibold text-slate-900">WireFluid Testnet</span>
            <span className="text-xs text-slate-500 font-medium">Chain {WIREFLUID_TESTNET_CHAIN_ID}</span>
          </div>
          <div className="w-px h-4 bg-slate-200"></div>
          <span className="text-xs text-slate-500 hidden md:inline">{contractsConfigured ? 'Contracts ready' : 'Addresses missing'}</span>
        </div>

        {/* Right: Actions & Account */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notifications */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-lg hover:bg-slate-100 transition-smooth focus-ring group hidden md:flex"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-smooth" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <div className="hidden xl:flex items-center gap-1">
            {roleChips.map(([label, enabled]) => (
              <span
                key={label}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="hidden lg:block">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                if (!connected) {
                  return (
                    <button onClick={openConnectModal} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white">
                      Connect Wallet
                    </button>
                  );
                }
                return (
                  <button
                    onClick={chain.unsupported ? openChainModal : openAccountModal}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    {chain.unsupported ? 'Wrong network' : shortAddress(account.address)}
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Wallet Balance */}
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-300 transition-smooth shadow-sm hover:shadow-md group">
            <span className="text-blue-600 font-bold text-lg">WIRE</span>
            <div className="flex-col hidden sm:flex">
              <span className="text-xs text-slate-600 font-medium">Demo balance</span>
              <span className="font-bold text-slate-900 text-sm tabular-nums">{state.wireBalance.toLocaleString()}</span>
            </div>
            <span className="text-sm md:hidden font-bold text-slate-900 tabular-nums">{state.wireBalance.toLocaleString()}</span>
          </div>

          {/* Settings */}
          <button 
            className="p-2.5 rounded-lg hover:bg-slate-100 transition-smooth focus-ring group hidden md:flex"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-smooth" />
          </button>

          {/* Profile Avatar */}
          <div className="w-9 md:w-10 h-9 md:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full border-2 border-teal-600 shadow-sm flex items-center justify-center text-white text-xs md:text-sm font-bold hover:shadow-md transition-smooth cursor-pointer transform hover:scale-110 active:scale-95">
            AC
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-[73px] right-4 md:right-8 w-80 bg-white border border-slate-200 rounded-lg shadow-lg animate-slide-down z-50">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {[
                { title: 'Match Started', desc: 'KK vs MS is now LIVE', time: '2 mins' },
                { title: 'Points Awarded', desc: 'You gained 45 points', time: '12 mins' },
                { title: 'Rank Update', desc: 'You moved to rank #8', time: '1 hour' },
              ].map((notif, idx) => (
                <div key={idx} className="p-4 border-b border-slate-200 hover:bg-slate-50 transition-smooth cursor-pointer group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-teal-600 transition-smooth">{notif.title}</p>
                      <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">{notif.desc}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0 ml-2">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
