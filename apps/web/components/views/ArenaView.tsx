'use client';

import { useState } from 'react';
import { AlertCircle, Sparkles, Lock, Trash2, ChevronDown } from 'lucide-react';
import { CricketPlayer, Squad } from '@/types/index';
import { PlayerList } from '@/components/PlayerList';
import { CricketPitch } from '@/components/CricketPitch';
import { NFTPreviewCard } from '@/components/NFTPreviewCard';
import type { IndexedContest } from '@/api/indexerClient';
import { formatWire } from '@/utils/arenaFormat';

interface ArenaViewProps {
  availablePlayers: CricketPlayer[];
  squad: Squad;
  creditsUsed: number;
  isSquadValid: boolean;
  matchStatus: string;
  onAddPlayer: (player: CricketPlayer) => void;
  onRemovePlayer: (playerId: string) => void;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  selectedContest?: IndexedContest | null;
  onJoinContest?: () => Promise<void>;
  isJoining?: boolean;
  txHash?: string;
  txError?: string;
}

export function ArenaView({
  availablePlayers,
  squad,
  creditsUsed,
  isSquadValid,
  matchStatus,
  onAddPlayer,
  onRemovePlayer,
  onSetCaptain,
  onSetViceCaptain,
  selectedContest,
  onJoinContest,
  isJoining = false,
  txHash,
  txError,
}: ArenaViewProps) {
  const [showNFTPreview, setShowNFTPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSquad, setExpandedSquad] = useState(false);
  const creditsAvailable = 100 - creditsUsed;

  const handleMintNFT = async () => {
    if (!isSquadValid) {
      setError('Squad must have 11 players, C & VC assigned, and be within 100 credits');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setShowNFTPreview(true);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-73px)] gap-0 bg-white">
      {/* Left: Player List - Hidden on mobile, shown on lg screens */}
      <div className="hidden lg:block lg:w-80 xl:w-96 bg-white border-r border-slate-200 overflow-y-auto">
        <PlayerList availablePlayers={availablePlayers} onSelectPlayer={onAddPlayer} creditsUsed={creditsUsed} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Player List Toggle */}
        <div className="lg:hidden px-4 py-3 border-b border-slate-200 bg-slate-50">
          <button 
            onClick={() => setExpandedSquad(!expandedSquad)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span>Available Players</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSquad ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Expanded Player List */}
        {expandedSquad && (
          <div className="lg:hidden border-b border-slate-200 bg-white overflow-y-auto max-h-96">
            <PlayerList availablePlayers={availablePlayers} onSelectPlayer={onAddPlayer} creditsUsed={creditsUsed} />
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-slide-down shadow-sm text-sm">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Squad Status - Compact Cards */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
              {[
                { label: 'Squad', value: squad.players.length, max: 11, color: 'teal', icon: '👥' },
                { label: 'Credits', value: creditsUsed, max: 100, color: 'blue', icon: '💎', subtext: `${creditsAvailable}` },
                { label: 'Status', value: isSquadValid ? 'Ready' : 'Incomplete', color: isSquadValid ? 'emerald' : 'slate', icon: isSquadValid ? '✓' : '○' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 border transition-smooth text-sm ${
                    stat.label === 'Status'
                      ? isSquadValid
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 font-semibold">{stat.icon}</span>
                    <span className="text-xs text-slate-600 uppercase font-semibold">{stat.label}</span>
                  </div>
                  <p className={`text-lg font-bold text-${stat.color}-700`}>{stat.value}</p>
                  {stat.max && <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                    <div className={`h-full rounded-full bg-${stat.color}-600`} style={{ width: `${(stat.value / stat.max) * 100}%` }} />
                  </div>}
                  {stat.subtext && <p className="text-xs text-slate-600 mt-1">{stat.subtext} left</p>}
                </div>
              ))}
            </div>

            {/* Match Locked Warning */}
            {matchStatus === 'LOCKED' && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-sm">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-900"><span className="font-semibold">Match Locked</span> — No further changes allowed</p>
              </div>
            )}

            {/* Pitch and Squad Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              {/* Pitch Visualization - Takes 2 cols on large screens */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200 p-4">
                  <div className="aspect-video max-w-2xl mx-auto relative bg-white rounded-lg border-2 border-dashed border-teal-300/40 overflow-hidden shadow-sm">
                    {/* Cricket Field */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
                      <ellipse cx="200" cy="125" rx="150" ry="80" fill="none" stroke="#14B8A6" strokeWidth="2" opacity="0.25" />
                      <line x1="200" y1="30" x2="200" y2="220" stroke="#14B8A6" strokeWidth="1" opacity="0.15" />
                      <circle cx="200" cy="125" r="30" fill="none" stroke="#14B8A6" strokeWidth="1" opacity="0.15" />
                    </svg>

                    {/* Player Positions - Properly sized */}
                    <div className="relative w-full h-full flex flex-col justify-between p-2">
                      {/* Top: WK */}
                      {squad.players.filter(p => p.role === 'WK').length > 0 && (
                        <div className="flex justify-center gap-1">
                          {squad.players.filter(p => p.role === 'WK').slice(0, 2).map((p) => (
                            <div key={p.id} className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center border border-white shadow-sm" title={p.name}>
                              {p.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Middle rows */}
                      <div className="flex justify-between items-center px-1">
                        {/* Left: BAT */}
                        {squad.players.filter(p => p.role === 'BAT').length > 0 && (
                          <div className="flex flex-col gap-1">
                            {squad.players.filter(p => p.role === 'BAT').slice(0, 2).map((p) => (
                              <div key={p.id} className="w-5 h-5 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center border border-white shadow-sm" title={p.name}>
                                {p.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Center: AR */}
                        {squad.players.filter(p => p.role === 'AR').length > 0 && (
                          <div className="flex flex-col gap-1">
                            {squad.players.filter(p => p.role === 'AR').slice(0, 3).map((p) => (
                              <div key={p.id} className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center border border-white shadow-sm" title={p.name}>
                                {p.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Right: BOWL */}
                        {squad.players.filter(p => p.role === 'BOWL').length > 0 && (
                          <div className="flex flex-col gap-1">
                            {squad.players.filter(p => p.role === 'BOWL').slice(0, 2).map((p) => (
                              <div key={p.id} className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center border border-white shadow-sm" title={p.name}>
                                {p.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom: Extra bowlers */}
                      {squad.players.filter(p => p.role === 'BOWL').length > 2 && (
                        <div className="flex justify-center gap-1">
                          {squad.players.filter(p => p.role === 'BOWL').slice(2, 4).map((p) => (
                            <div key={p.id} className="w-5 h-5 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center border border-white shadow-sm" title={p.name}>
                              {p.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* NFT Preview and Actions - Takes 1 col */}
              <div className="space-y-4">
                <NFTPreviewCard squadId="#2841" squadName="My Arena" captainName={squad.players.find(p => p.id === squad.captainId)?.name || 'N/A'} playersCount={squad.players.length} />

                {selectedContest && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Contest</span>
                      <span className="font-semibold text-slate-900">#{selectedContest.contestId}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-slate-600">Entry fee</span>
                      <span className="font-semibold text-slate-900">{formatWire(selectedContest.entryFee)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-slate-600">Entries</span>
                      <span className="font-semibold text-slate-900">{selectedContest.totalEntries}/{selectedContest.maxEntries}</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleMintNFT}
                  disabled={!isSquadValid || matchStatus === 'LOCKED' || !selectedContest || isJoining}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-smooth flex items-center justify-center gap-2 ${
                    isSquadValid && matchStatus !== 'LOCKED' && selectedContest && !isJoining
                      ? 'bg-teal-600 hover:bg-teal-700 shadow-sm hover:shadow-md active:scale-95'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isJoining ? 'Joining Contest...' : selectedContest ? 'Join Contest' : 'No Open Contest'}
                </button>

                {txHash && <p className="text-xs text-slate-600 break-all">Submitted: {txHash}</p>}
                {txError && <p className="text-xs text-red-600">{txError}</p>}
              </div>
            </div>

            {/* Squad Players List - Compact */}
            {squad.players.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">Selected Squad</h3>
                  <span className="text-xs text-slate-600">{squad.players.length} players</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">Player</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-700 hidden sm:table-cell">Role</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-700">Cred</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-700">C/VC</th>
                        <th className="px-3 py-2 text-center font-semibold text-slate-700">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {squad.players.map((player) => (
                        <tr key={player.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2">
                            <p className="font-semibold text-slate-900">{player.name}</p>
                            <p className="text-xs text-slate-600">{player.team}</p>
                          </td>
                          <td className="px-3 py-2 text-center hidden sm:table-cell">
                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-700">{['WK', 'BAT', 'AR', 'BOWL'].includes(player.role) ? player.role : 'N/A'}</span>
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-slate-900">{player.credits}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => onSetCaptain(player.id)}
                                disabled={matchStatus === 'LOCKED'}
                                className={`p-1 rounded text-xs font-bold ${
                                  squad.captainId === player.id
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                } ${matchStatus === 'LOCKED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Captain"
                              >
                                C
                              </button>
                              <button
                                onClick={() => onSetViceCaptain(player.id)}
                                disabled={matchStatus === 'LOCKED'}
                                className={`p-1 rounded text-xs font-bold ${
                                  squad.viceCaptainId === player.id
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                } ${matchStatus === 'LOCKED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Vice Captain"
                              >
                                VC
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => onRemovePlayer(player.id)}
                              disabled={matchStatus === 'LOCKED'}
                              className={`p-1 rounded text-red-600 hover:bg-red-50 transition-colors ${
                                matchStatus === 'LOCKED' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {squad.players.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-600 text-sm">No players selected yet. Choose players from the left to build your squad.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NFT Mint Modal */}
      {showNFTPreview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-md w-full p-6 md:p-8 shadow-lg animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Squad NFT Ready</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">Your squad is ready to mint as a blockchain asset</p>

            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-5 mb-6 border border-teal-200 space-y-3 text-sm">
              <div className="text-center">
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide">Squad ID</p>
                <p className="text-4xl font-black text-slate-900">#2841</p>
              </div>

              <div className="bg-white rounded-lg p-3 border-2 border-dashed border-teal-300 text-center space-y-1">
                <p className="text-xs text-slate-600 uppercase font-semibold">Captain</p>
                <p className="font-bold text-slate-900">{squad.players.find(p => p.id === squad.captainId)?.name || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded p-2 text-center">
                  <p className="text-xs text-slate-600">Players</p>
                  <p className="font-bold text-slate-900">{squad.players.length}</p>
                </div>
                <div className="bg-slate-50 rounded p-2 text-center">
                  <p className="text-xs text-slate-600">Credits</p>
                  <p className="font-bold text-slate-900">{creditsUsed}/100</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNFTPreview(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-900 rounded-lg hover:bg-slate-50 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (onJoinContest) await onJoinContest();
                  setShowNFTPreview(false);
                }}
                disabled={!onJoinContest || isJoining}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-semibold text-sm transition-colors"
              >
                {isJoining ? 'Waiting...' : 'Confirm Join'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
