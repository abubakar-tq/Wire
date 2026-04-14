"use client";

import { ArrowUpRight, BadgeCheck, ChevronDown, Database, Gift, Layers3, ShieldCheck, Trophy, TrendingUp, Wallet, Zap } from 'lucide-react';
import { AppState } from '@/types/index';
import { useState } from 'react';
import { useIndexerSummary, useCurrentUserPassport } from '@/api/useIndexerData';
import { useSiweSession } from '@/auth/useSiweSession';
import { contractsConfigured } from '@/contracts/addresses';

interface DashboardViewProps {
  state: AppState;
}

export function DashboardView({ state }: DashboardViewProps) {
  const [expandedSections, setExpandedSections] = useState({
    earnings: true,
    actions: true,
    tips: false,
  });
  const summary = useIndexerSummary();
  const passport = useCurrentUserPassport();
  const auth = useSiweSession();

  const userRank = state.leaderboard.find((e) => e.isCurrentUser)?.rank || 0;
  const userPoints = state.leaderboard.find((e) => e.isCurrentUser)?.totalPoints || 0;
  const indexerUrl = process.env.NEXT_PUBLIC_INDEXER_URL ?? 'http://localhost:42069';
  const rpcUrl = process.env.NEXT_PUBLIC_WIREFLUID_RPC_URL ?? 'http://127.0.0.1:8545';
  const passportStats = passport.data?.passport ?? null;
  const passportBalance = passport.data?.balance ?? null;

  const earningsData = [
    { day: 'Mon', earnings: 245 },
    { day: 'Tue', earnings: 428 },
    { day: 'Wed', earnings: 312 },
    { day: 'Thu', earnings: 567 },
    { day: 'Fri', earnings: 734 },
    { day: 'Sat', earnings: 892 },
    { day: 'Sun', earnings: 1156 },
  ];

  const totalEarnings = earningsData.reduce((sum, d) => sum + d.earnings, 0);
  const maxEarnings = Math.max(...earningsData.map((d) => d.earnings));

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        {/* Header Section */}
        <div className="mb-4 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">Welcome Back</h1>
          <p className="text-slate-600 text-sm">Your fantasy sports dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-5 animate-fade-in-up" style={{ animationDelay: '25ms' }}>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-teal-600" />
              <h2 className="font-bold text-slate-900">Data Sources</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <SourceItem label="Indexer" value={indexerUrl} detail={summary.isError ? 'Unavailable' : 'Ponder API and audit history'} tone={summary.isError ? 'warn' : 'good'} />
              <SourceItem label="RPC" value={rpcUrl} detail="Direct contract reads and writes" tone="good" />
              <SourceItem label="Passport" value={passportStats ? `#${passportStats.tokenId}` : 'Not minted yet'} detail={passportStats ? `${passportStats.contestsEntered} entries · ${passportStats.contestsWon} wins` : 'Indexed from LegacyPassport'} tone={passportStats ? 'good' : 'muted'} />
              <SourceItem label="Auth" value={auth.authenticated ? 'SIWE signed in' : 'Wallet only'} detail={auth.session?.address ?? 'Admin routes stay protected on-chain'} tone={auth.authenticated ? 'good' : 'muted'} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <h2 className="font-bold">Access</h2>
            </div>
            <p className="text-sm text-slate-300 mb-3">{state.userRole === 'ADMIN' ? 'Admin features are available for this wallet.' : 'Player mode. Admin actions require on-chain roles plus SIWE.'}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <MiniStat label="Contracts" value={contractsConfigured ? 'Ready' : 'Missing'} />
              <MiniStat label="Role" value={state.userRole} />
              <MiniStat label="Session" value={auth.authenticated ? 'Signed in' : 'Unsigned'} />
              <MiniStat label="Passport" value={passportBalance ? 'Indexed' : 'None'} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Layers3 className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900">What You See</h2>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Live rankings and contest data come from the local Ponder indexer.</p>
              <p>Squad edits and contest joins go directly through wagmi/viem to the contracts.</p>
              <p>Legacy passport stats are indexed from on-chain events and shown after a wallet connects.</p>
            </div>
          </div>
        </div>

        {/* KPI Cards - Staggered Animation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-5">
          {[
            { icon: Trophy, label: 'Rank', value: `#${userRank}`, subtext: 'Global', color: '#F59E0B', delay: 0 },
            { icon: TrendingUp, label: 'Points', value: userPoints.toLocaleString(), subtext: 'Total', color: '#10B981', delay: 50 },
            { icon: Zap, label: 'Squad', value: state.squad.players.length, subtext: 'Players', color: '#8B5CF6', delay: 100 },
            { icon: Gift, label: 'Balance', value: state.wireBalance.toLocaleString(), subtext: 'Available', color: '#F59E0B', delay: 150 },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="animate-fade-in-up"
                style={{ animationDelay: `${kpi.delay}ms` }}
              >
                <div className="bg-white border border-slate-200 rounded-lg p-3 md:p-4 hover:shadow-sm transition-smooth group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100" style={{ backgroundColor: `${kpi.color}15` }}>
                      <Icon className="w-8 h-8 p-1.5" style={{ color: kpi.color }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 uppercase">{kpi.label}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900 mb-0.5 tabular-nums">{kpi.value}</p>
                  <p className="text-xs text-slate-600">{kpi.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earnings Chart Section - Collapsible */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => toggleSection('earnings')}
            className="w-full bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-smooth text-left group mb-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 mb-0.5">Weekly Earnings</h2>
                <p className="text-xs md:text-sm text-slate-600">Total: <span className="text-amber-600 font-bold">{totalEarnings}</span></p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-smooth ${expandedSections.earnings ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.earnings && (
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 animate-slide-down">
              <div className="flex items-end gap-1.5 h-40">
                {earningsData.map((data, idx) => (
                  <div
                    key={data.day}
                    className="flex-1 flex flex-col items-center group"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${idx * 50}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <div className="relative w-full flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-[#10B981] to-[#059669] rounded-t-lg transition-smooth hover:shadow-lg group-hover:from-[#059669] group-hover:to-[#047857]"
                        style={{
                          height: `${(data.earnings / maxEarnings) * 100}%`,
                          minHeight: '4px',
                        }}
                      />
                      <span className="text-xs text-[#5B6B7A] mt-3 font-medium">{data.day}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Grid - Actions & Match Status */}
        <div className="grid md:grid-cols-2 gap-3 md:gap-4 mb-4">
          {/* Quick Actions */}
          <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            <button
              onClick={() => toggleSection('actions')}
              className="w-full bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-smooth text-left group mb-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-lg font-bold text-slate-900">Quick Actions</h2>
                <ChevronDown className={`w-4 h-4 text-slate-600 transition-smooth ${expandedSections.actions ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expandedSections.actions && (
              <div className="space-y-1.5 animate-slide-down">
                {[
                  { label: 'New Arena', desc: 'Build squad', icon: Zap, color: '#10B981' },
                  { label: 'Rewards', desc: 'View earnings', icon: Gift, color: '#F59E0B' },
                  { label: 'NFT Cards', desc: 'Squad NFTs', icon: Trophy, color: '#8B5CF6' },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      className="w-full p-3 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-smooth group flex items-center justify-between"
                      style={{
                        animation: `fadeInUp 0.4s ease-out ${idx * 50}ms forwards`,
                        opacity: 0,
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ backgroundColor: `${action.color}15` }}>
                          <Icon className="w-7 h-7 p-1.5" style={{ color: action.color }} />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs md:text-sm font-semibold text-slate-900 truncate">{action.label}</p>
                          <p className="text-xs text-slate-600 truncate">{action.desc}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 ml-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Match Status */}
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-smooth">
              <h2 className="text-base md:text-lg font-bold text-slate-900 mb-3">Current Match</h2>
              <div className="space-y-2">
                {[
                  { label: 'Match', value: 'KK vs MS', icon: '🏏' },
                  { label: 'Status', value: 'LIVE', icon: '🔴', live: true },
                  { label: 'Updates', value: 'Every 2-3s', icon: '⚡' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between group hover:bg-white transition-smooth text-sm"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${idx * 50}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs md:text-sm text-slate-600 font-medium">{item.label}</span>
                    </div>
                    <span className={`font-bold text-xs md:text-sm ${item.live ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}

                <div className="p-3 bg-teal-50 border border-teal-200 rounded mt-2 text-xs md:text-sm text-slate-900">
                  <p className="font-medium">Your squad is live and accumulating points. Check leaderboard for rankings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips - Collapsible */}
        <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <button
            onClick={() => toggleSection('tips')}
            className="w-full bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-sm transition-smooth text-left group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base md:text-lg">Pro Tips</h3>
              <ChevronDown className={`w-4 h-4 text-slate-600 transition-smooth ${expandedSections.tips ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.tips && (
            <div className="bg-purple-50 border border-purple-200 border-t-0 rounded-b-lg p-4 animate-slide-down">
              <ul className="space-y-1.5 text-xs md:text-sm text-slate-900">
                {[
                  'Captain 2x, Vice-Captain 1.5x points',
                  'Mix high-form players with underdogs',
                  'Check team composition early',
                  'Follow live leaderboard updates',
                ].map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${idx * 50}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <span className="text-teal-600 font-bold flex-shrink-0">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}

function SourceItem({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: 'good' | 'warn' | 'muted' }) {
  const toneClasses = {
    good: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    muted: 'border-slate-200 bg-slate-50 text-slate-900'
  } as const;

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
      <p className="mt-1 text-xs opacity-80">{detail}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-300">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}
