'use client';

import { Activity, TrendingUp, Wallet, Settings, AlertCircle } from 'lucide-react';

export function ProtocolView() {
  const protocolParams = [
    { label: 'Min Squad Size', value: '11 Players', status: 'active' },
    { label: 'Max Credits', value: '100 ◈', status: 'active' },
    { label: 'Captain Multiplier', value: '2x Points', status: 'active' },
    { label: 'Vice-Captain Multiplier', value: '1.5x Points', status: 'active' },
    { label: 'Min Credit per Player', value: '5 ◈', status: 'active' },
    { label: 'Max Credit per Player', value: '16 ◈', status: 'active' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">Protocol Settings</h1>
        <p className="text-[#4B5563]">Manage WireFluid Arena protocol parameters and configurations</p>
      </div>

      {/* Protocol Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-[#10B981]" />
            <span className="text-xs font-bold text-[#4B5563] uppercase">Network Status</span>
          </div>
          <p className="text-2xl font-bold text-[#10B981]">ACTIVE</p>
          <p className="text-xs text-[#4B5563] mt-2">All systems operational</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-[#2563EB]" />
            <span className="text-xs font-bold text-[#4B5563] uppercase">Version</span>
          </div>
          <p className="text-2xl font-bold text-[#2563EB]">v2.4.1</p>
          <p className="text-xs text-[#4B5563] mt-2">Latest stable</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-[#F5A623]" />
            <span className="text-xs font-bold text-[#4B5563] uppercase">Latency</span>
          </div>
          <p className="text-2xl font-bold text-[#F5A623]">42ms</p>
          <p className="text-xs text-[#4B5563] mt-2">Optimal performance</p>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#0F1117] mb-4">Active Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocolParams.map((param) => (
            <div key={param.label} className="p-4 border border-[#E5E7EB] rounded-lg bg-[#FAFAFA] flex items-center justify-between">
              <span className="text-sm text-[#4B5563]">{param.label}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#0F1117]">{param.value}</span>
                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update History */}
      <div className="mt-8 bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#0F1117] mb-4">Recent Updates</h2>
        <div className="space-y-3">
          {[
            { time: '2 hours ago', change: 'Enabled dynamic scoring', status: 'success' },
            { time: '5 hours ago', change: 'Updated team roster limits', status: 'success' },
            { time: '1 day ago', change: 'Protocol upgrade v2.4.0', status: 'success' },
          ].map((update, idx) => (
            <div key={idx} className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                <div>
                  <p className="font-semibold text-[#0F1117]">{update.change}</p>
                  <p className="text-xs text-[#4B5563]">{update.time}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#10B981] uppercase">Applied</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchView() {
  const matches = [
    { id: 1, team1: 'KK', team2: 'MS', status: 'LIVE', time: '2:15 PM' },
    { id: 2, team1: 'LQ', team2: 'IU', status: 'SCHEDULED', time: '4:00 PM' },
    { id: 3, team1: 'PZ', team2: 'QG', status: 'COMPLETED', time: '10:30 AM' },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">Match Management</h1>
        <p className="text-[#4B5563]">Configure match schedules, teams, and live events</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-[#EF4444]" />
            <span className="text-xs font-bold text-[#4B5563] uppercase">Live Matches</span>
          </div>
          <p className="text-2xl font-bold text-[#EF4444]">1</p>
          <p className="text-xs text-[#4B5563] mt-2">In progress</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-[#2563EB]" />
            <span className="text-xs font-bold text-[#4B5563] uppercase">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-[#2563EB]">8</p>
          <p className="text-xs text-[#4B5563] mt-2">This week</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-[#10B981]" />
            <span className="text-xs font-bold text-[#4B5563] uppercase">Total Players</span>
          </div>
          <p className="text-2xl font-bold text-[#10B981]">2,847</p>
          <p className="text-xs text-[#4B5563] mt-2">Active players</p>
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#0F1117]">Today's Matches</h2>
        </div>
        <table className="w-full">
          <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Match</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Players</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, idx) => (
              <tr key={match.id} className={`border-b border-[#E5E7EB] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                <td className="px-6 py-4 font-semibold text-[#0F1117]">{match.team1} vs {match.team2}</td>
                <td className="px-6 py-4 text-[#4B5563]">{match.time}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    match.status === 'LIVE' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                    match.status === 'SCHEDULED' ? 'bg-[#2563EB]/10 text-[#2563EB]' :
                    'bg-[#4B5563]/10 text-[#4B5563]'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      match.status === 'LIVE' ? 'bg-[#EF4444] animate-pulse' :
                      match.status === 'SCHEDULED' ? 'bg-[#2563EB]' :
                      'bg-[#4B5563]'
                    }`}></div>
                    {match.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#4B5563]">{Math.floor(Math.random() * 500) + 100}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TreasuryView() {
  const treasuryMetrics = [
    { label: 'Total Treasury', value: '◈ 5,234,567', change: '+12.5%' },
    { label: 'Entry Fees (7d)', value: '◈ 342,890', change: '+8.2%' },
    { label: 'Prize Pool (7d)', value: '◈ 285,234', change: '+15.3%' },
    { label: 'Admin Revenue', value: '◈ 57,656', change: '+5.1%' },
  ];

  const fundAllocation = [
    { category: 'Prize Pool', amount: '◈ 2,450,000', percentage: 47 },
    { category: 'Liquidity', amount: '◈ 1,500,000', percentage: 29 },
    { category: 'Operations', amount: '◈ 800,000', percentage: 15 },
    { category: 'Reserve', amount: '◈ 484,567', percentage: 9 },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">Treasury</h1>
        <p className="text-[#4B5563]">Monitor protocol treasury and financial metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {treasuryMetrics.map((metric) => (
          <div key={metric.label} className="bg-white border border-[#E5E7EB] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#4B5563] font-medium">{metric.label}</span>
              <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded">{metric.change}</span>
            </div>
            <p className="text-2xl font-bold text-[#0F1117]">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Fund Allocation */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#0F1117] mb-6">Fund Allocation</h2>
        <div className="space-y-6">
          {fundAllocation.map((fund) => (
            <div key={fund.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-[#0F1117]">{fund.category}</span>
                <span className="text-sm font-bold text-[#F5A623]">{fund.amount}</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#2563EB] to-[#10B981] h-full transition-all duration-300"
                  style={{ width: `${fund.percentage}%` }}
                />
              </div>
              <p className="text-xs text-[#4B5563] mt-1">{fund.percentage}% of total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 bg-white border border-[#E5E7EB] rounded-xl p-6">
        <h2 className="text-lg font-bold text-[#0F1117] mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {[
            { type: 'Prize Distribution', amount: '◈ 45,234', time: '12 mins ago', status: 'completed' },
            { type: 'Entry Fees Collected', amount: '◈ 28,900', time: '34 mins ago', status: 'completed' },
            { type: 'Liquidity Added', amount: '◈ 100,000', time: '2 hours ago', status: 'completed' },
          ].map((tx, idx) => (
            <div key={idx} className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Wallet className="w-5 h-5 text-[#F5A623]" />
                <div>
                  <p className="font-semibold text-[#0F1117]">{tx.type}</p>
                  <p className="text-xs text-[#4B5563]">{tx.time}</p>
                </div>
              </div>
              <span className="font-bold text-[#0F1117]">{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
