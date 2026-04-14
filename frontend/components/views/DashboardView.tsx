'use client';

import { Trophy, TrendingUp, Zap, Gift, BarChart3, ArrowUpRight, ChevronDown } from 'lucide-react';
import { AppState } from '@/types/index';
import { useState } from 'react';

interface DashboardViewProps {
  state: AppState;
}

export function DashboardView({ state }: DashboardViewProps) {
  const [expandedSections, setExpandedSections] = useState({
    earnings: true,
    actions: true,
    tips: false,
  });

  const userRank = state.leaderboard.find((e) => e.isCurrentUser)?.rank || 0;
  const userPoints = state.leaderboard.find((e) => e.isCurrentUser)?.totalPoints || 0;

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
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-gradient-to-br from-[#FAFAFA] via-white to-[#F0FDF4]/30">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F1117] mb-2">Welcome Back</h1>
          <p className="text-[#5B6B7A] text-lg">Your fantasy sports dashboard</p>
        </div>

        {/* KPI Cards - Staggered Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Trophy, label: 'Rank', value: `#${userRank}`, subtext: 'Global Leaderboard', color: '#F5A623', delay: 0 },
            { icon: TrendingUp, label: 'Points', value: userPoints.toLocaleString(), subtext: 'Season Total', color: '#10B981', delay: 100 },
            { icon: Zap, label: 'Squad', value: state.squad.players.length, subtext: 'Players', color: '#8B5CF6', delay: 200 },
            { icon: Gift, label: 'Balance', value: `◈ ${state.wireBalance.toLocaleString()}`, subtext: 'Available', color: '#F5A623', delay: 300 },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="animate-fade-in-up"
                style={{ animationDelay: `${kpi.delay}ms` }}
              >
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth group hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-lg`} style={{ backgroundColor: `${kpi.color}15` }}>
                      <Icon className="w-10 h-10 p-2" style={{ color: kpi.color }} />
                    </div>
                    <span className="text-xs font-bold text-[#5B6B7A] uppercase">{kpi.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-[#0F1117] mb-1 tabular-nums">{kpi.value}</p>
                  <p className="text-xs text-[#5B6B7A]">{kpi.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earnings Chart Section - Collapsible */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <button
            onClick={() => toggleSection('earnings')}
            className="w-full bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth text-left group mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#0F1117] mb-1">Weekly Earnings</h2>
                <p className="text-sm text-[#5B6B7A]">Total: <span className="text-[#F5A623] font-bold">◈ {totalEarnings}</span></p>
              </div>
              <ChevronDown className={`w-5 h-5 text-[#5B6B7A] transition-smooth ${expandedSections.earnings ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.earnings && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card mb-8 animate-slide-down">
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
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={() => toggleSection('actions')}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth text-left group mb-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0F1117]">Quick Actions</h2>
                <ChevronDown className={`w-5 h-5 text-[#5B6B7A] transition-smooth ${expandedSections.actions ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {expandedSections.actions && (
              <div className="space-y-2 animate-slide-down">
                {[
                  { label: 'Start New Arena', desc: 'Build a new squad', icon: Zap, color: '#10B981' },
                  { label: 'Claim Rewards', desc: 'View earnings', icon: Gift, color: '#F5A623' },
                  { label: 'NFT Portfolio', desc: 'Your squad cards', icon: Trophy, color: '#8B5CF6' },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      className="w-full p-4 rounded-lg bg-white border border-[#E5E7EB] hover:border-[#10B981] transition-smooth group flex items-center justify-between shadow-card hover:shadow-elevated"
                      style={{
                        animation: `fadeInUp 0.4s ease-out ${idx * 100}ms forwards`,
                        opacity: 0,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: `${action.color}15` }}>
                          <Icon className="w-8 h-8 p-2" style={{ color: action.color }} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-[#0F1117]">{action.label}</p>
                          <p className="text-xs text-[#5B6B7A]">{action.desc}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#5B6B7A] group-hover:text-[#10B981] transition-smooth" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Match Status */}
          <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth h-full">
              <h2 className="text-lg font-bold text-[#0F1117] mb-4">Current Match</h2>
              <div className="space-y-3">
                {[
                  { label: 'Match', value: 'KK vs MS', icon: '🏏' },
                  { label: 'Status', value: 'LIVE', icon: '🔴', live: true },
                  { label: 'Updates', value: 'Every 2-3s', icon: '⚡' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-[#FAFAFA] to-white rounded-lg border border-[#E5E7EB] flex items-center justify-between group hover:border-[#10B981] transition-smooth"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${idx * 100}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm text-[#5B6B7A] font-medium">{item.label}</span>
                    </div>
                    <span className={`font-bold ${item.live ? 'text-[#EF4444] animate-pulse' : 'text-[#0F1117]'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}

                <div className="p-4 bg-gradient-to-r from-[#10B981]/5 to-transparent border border-[#10B981]/20 rounded-lg mt-4">
                  <p className="text-sm text-[#0F1117] font-medium">Match is live and your squad is accumulating points in real-time. Check the leaderboard for live rankings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tips - Collapsible */}
        <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <button
            onClick={() => toggleSection('tips')}
            className="w-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#2563EB]/10 border border-[#8B5CF6]/20 rounded-xl p-6 shadow-card hover:shadow-elevated transition-smooth text-left group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#0F1117]">Pro Tips</h3>
              <ChevronDown className={`w-5 h-5 text-[#5B6B7A] transition-smooth ${expandedSections.tips ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expandedSections.tips && (
            <div className="bg-gradient-to-r from-[#8B5CF6]/10 to-[#2563EB]/10 border border-[#8B5CF6]/20 border-t-0 rounded-b-xl p-6 animate-slide-down">
              <ul className="space-y-2 text-sm text-[#0F1117]">
                {[
                  'Captain gets 2x points, Vice-Captain gets 1.5x points',
                  'Balance your squad: mix high-form players with underdogs',
                  'Use AI Insights to get real-time recommendations',
                  'Check team composition before match starts',
                ].map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${idx * 100}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
