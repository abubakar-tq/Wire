'use client';

import { Activity, TrendingUp, Wallet, Settings, AlertCircle, Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import { useState } from 'react';

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
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Protocol Settings</h1>
        <p className="text-slate-600">Manage WireFluid Arena protocol parameters and configurations</p>
      </div>

      {/* Protocol Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Network Status</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600">ACTIVE</p>
          <p className="text-xs text-slate-600 mt-2">All systems operational</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Version</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">v2.4.1</p>
          <p className="text-xs text-slate-600 mt-2">Latest stable</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Latency</span>
          </div>
          <p className="text-3xl font-bold text-amber-600">42ms</p>
          <p className="text-xs text-slate-600 mt-2">Optimal performance</p>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Active Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocolParams.map((param) => (
            <div key={param.label} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between hover:bg-white transition-colors">
              <span className="text-sm font-medium text-slate-700">{param.label}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{param.value}</span>
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update History */}
      <div className="mt-8 bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Updates</h2>
        <div className="space-y-3">
          {[
            { time: '2 hours ago', change: 'Enabled dynamic scoring', status: 'success' },
            { time: '5 hours ago', change: 'Updated team roster limits', status: 'success' },
            { time: '1 day ago', change: 'Protocol upgrade v2.4.0', status: 'success' },
          ].map((update, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-white transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-900">{update.change}</p>
                  <p className="text-xs text-slate-600">{update.time}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase">Applied</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchView() {
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const matches = [
    { id: 1, team1: 'KK', team2: 'MS', status: 'LIVE', time: '2:15 PM', team1Players: 11, team2Players: 11, date: 'Apr 15, 2026' },
    { id: 2, team1: 'LQ', team2: 'IU', status: 'SCHEDULED', time: '4:00 PM', team1Players: 11, team2Players: 11, date: 'Apr 15, 2026' },
    { id: 3, team1: 'PZ', team2: 'QG', status: 'COMPLETED', time: '10:30 AM', team1Players: 11, team2Players: 11, date: 'Apr 14, 2026' },
    { id: 4, team1: 'RR', team2: 'GT', status: 'SCHEDULED', time: '6:30 PM', team1Players: 11, team2Players: 11, date: 'Apr 15, 2026' },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Match Management</h1>
          <p className="text-slate-600">Create matches, assign teams, and manage player rosters</p>
        </div>
        <button
          onClick={() => setShowCreateMatch(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-smooth font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Match
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-red-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Live Matches</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">1</p>
          <p className="text-xs text-slate-600 mt-2">In progress now</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Scheduled</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">3</p>
          <p className="text-xs text-slate-600 mt-2">This week</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Players</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">2,847</p>
          <p className="text-xs text-slate-600 mt-2">Active this week</p>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
            className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-xs font-semibold text-slate-600 uppercase">{match.date}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold ${
                    match.status === 'LIVE' ? 'bg-red-100 text-red-700' :
                    match.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      match.status === 'LIVE' ? 'bg-red-600 animate-pulse' :
                      match.status === 'SCHEDULED' ? 'bg-blue-600' :
                      'bg-slate-600'
                    }`}></div>
                    {match.status}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{match.team1}</p>
                    <p className="text-xs text-slate-600 mt-1">{match.team1Players} Players</p>
                  </div>
                  <p className="text-slate-400 font-light">vs</p>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{match.team2}</p>
                    <p className="text-xs text-slate-600 mt-1">{match.team2Players} Players</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-lg font-semibold text-slate-900">{match.time}</p>
                    <p className="text-xs text-slate-600">Game time</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedMatch === match.id && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">{match.team1} Roster</h3>
                    <div className="space-y-2">
                      {['Rohit Sharma', 'Virat Kohli', 'Suryakumar Yadav', 'Hardik Pandya', 'Jasprit Bumrah'].map((p, i) => (
                        <div key={i} className="text-xs text-slate-600 py-1 px-2 bg-slate-50 rounded flex items-center justify-between">
                          <span>{p}</span>
                          <button className="text-slate-400 hover:text-red-600">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">{match.team2} Roster</h3>
                    <div className="space-y-2">
                      {['Pat Cummins', 'Steve Smith', 'Glenn Maxwell', 'Josh Hazlewood', 'Marnus Labuschagne'].map((p, i) => (
                        <div key={i} className="text-xs text-slate-600 py-1 px-2 bg-slate-50 rounded flex items-center justify-between">
                          <span>{p}</span>
                          <button className="text-slate-400 hover:text-red-600">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded text-sm font-semibold transition-colors">
                    Add Player
                  </button>
                  <button className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-semibold transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Match Modal */}
      {showCreateMatch && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-lg animate-scale-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Match</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Team 1</label>
                <input type="text" placeholder="e.g., KK" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Team 2</label>
                <input type="text" placeholder="e.g., MS" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Match Date & Time</label>
                <input type="datetime-local" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-teal-600 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreateMatch(false)} className="flex-1 px-4 py-2 border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-50 font-semibold">
                Cancel
              </button>
              <button onClick={() => setShowCreateMatch(false)} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
                Create Match
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Treasury</h1>
        <p className="text-slate-600">Monitor protocol treasury and financial metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {treasuryMetrics.map((metric) => (
          <div key={metric.label} className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-700 font-medium">{metric.label}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">{metric.change}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Fund Allocation */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Fund Allocation</h2>
        <div className="space-y-6">
          {fundAllocation.map((fund) => (
            <div key={fund.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">{fund.category}</span>
                <span className="text-sm font-bold text-blue-600">{fund.amount}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 h-full transition-all duration-300"
                  style={{ width: `${fund.percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1">{fund.percentage}% of total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {[
            { type: 'Prize Distribution', amount: '◈ 45,234', time: '12 mins ago', status: 'completed' },
            { type: 'Entry Fees Collected', amount: '◈ 28,900', time: '34 mins ago', status: 'completed' },
            { type: 'Liquidity Added', amount: '◈ 100,000', time: '2 hours ago', status: 'completed' },
          ].map((tx, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between hover:bg-white transition-colors">
              <div className="flex items-center gap-4">
                <Wallet className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-slate-900">{tx.type}</p>
                  <p className="text-xs text-slate-600">{tx.time}</p>
                </div>
              </div>
              <span className="font-bold text-slate-900">{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
