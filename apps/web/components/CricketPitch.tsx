'use client';

import { Trash2, Crown, Lock } from 'lucide-react';
import { CricketPlayer } from '@/types/index';

const ROLE_LABELS: Record<string, string> = {
  WK: 'Wicket Keeper',
  BAT: 'Batter',
  AR: 'All-rounder',
  BOWL: 'Bowler',
};

const TEAM_BADGES = ['bg-teal-700', 'bg-blue-700', 'bg-emerald-700', 'bg-slate-800'];

function teamBadgeClass(team: string) {
  let hash = 0;
  for (let index = 0; index < team.length; index += 1) {
    hash += team.charCodeAt(index);
  }
  return TEAM_BADGES[hash % TEAM_BADGES.length];
}

interface CricketPitchProps {
  players: CricketPlayer[];
  captainId: string | null;
  viceCaptainId: string | null;
  onRemovePlayer: (playerId: string) => void;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  matchStatus: string;
}

export function CricketPitch({
  players,
  captainId,
  viceCaptainId,
  onRemovePlayer,
  onSetCaptain,
  onSetViceCaptain,
  matchStatus,
}: CricketPitchProps) {
  const isLocked = matchStatus === 'LOCKED';

  // Organize players by role
  const roleGroups = {
    WK: players.filter((p) => p.role === 'WK'),
    BAT: players.filter((p) => p.role === 'BAT'),
    AR: players.filter((p) => p.role === 'AR'),
    BOWL: players.filter((p) => p.role === 'BOWL'),
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Squad</h2>
          <p className="text-sm text-slate-600 mt-1">
            {players.length} / 11 Players • {captainId && viceCaptainId ? '✓ C & VC Set' : '⚠ Set Captain & Vice'}
          </p>
        </div>

        {/* Pitch Visualization */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200 p-4 md:p-6 mb-6">
          <div className="aspect-video max-w-2xl mx-auto relative bg-white rounded-lg border-2 border-dashed border-teal-300/40 overflow-hidden shadow-sm">
            {/* Cricket Field */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
              <ellipse cx="200" cy="125" rx="150" ry="80" fill="none" stroke="#14B8A6" strokeWidth="2" opacity="0.25" />
              <line x1="200" y1="30" x2="200" y2="220" stroke="#14B8A6" strokeWidth="1" opacity="0.15" />
              <circle cx="200" cy="125" r="30" fill="none" stroke="#14B8A6" strokeWidth="1" opacity="0.15" />
            </svg>

            {/* Player Positions */}
            <div className="relative w-full h-full p-3">
              {/* Wicket Keepers - Top */}
              {roleGroups.WK.length > 0 && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <p className="text-xs font-semibold text-slate-600 mb-1 text-center whitespace-nowrap">WK</p>
                  <div className="flex gap-1.5">
                    {roleGroups.WK.map((player) => (
                      <div
                        key={player.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white shadow-sm ${teamBadgeClass(player.team)}`}
                        title={player.name}
                      >
                        {player.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Middle Row - Batters, All-rounders */}
              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-between px-2">
                {/* Batters - Left */}
                {roleGroups.BAT.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-slate-600 mb-0.5">BAT</p>
                    {roleGroups.BAT.slice(0, 3).map((player) => (
                      <div
                        key={player.id}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white shadow-sm ${teamBadgeClass(player.team)}`}
                        title={player.name}
                      >
                        {player.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                )}

                {/* All-rounders - Center */}
                {roleGroups.AR.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-slate-600 mb-0.5">AR</p>
                    {roleGroups.AR.slice(0, 3).map((player) => (
                      <div
                        key={player.id}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white shadow-sm ${teamBadgeClass(player.team)}`}
                        title={player.name}
                      >
                        {player.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bowlers - Bottom */}
              {roleGroups.BOWL.length > 0 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <p className="text-xs font-semibold text-slate-600 mb-1 text-center whitespace-nowrap">BOWL</p>
                  <div className="flex gap-1.5">
                    {roleGroups.BOWL.slice(0, 5).map((player) => (
                      <div
                        key={player.id}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white shadow-sm ${teamBadgeClass(player.team)}`}
                        title={player.name}
                      >
                        {player.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Players Table - Compact & Responsive */}
        {players.length > 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm">Selected Squad</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-3 md:px-4 py-2 text-left font-semibold text-slate-700 uppercase text-xs tracking-wider">Player</th>
                    <th className="hidden sm:table-cell px-3 md:px-4 py-2 text-center font-semibold text-slate-700 uppercase text-xs tracking-wider">Role</th>
                    <th className="px-3 md:px-4 py-2 text-center font-semibold text-slate-700 uppercase text-xs tracking-wider">Credits</th>
                    <th className="px-3 md:px-4 py-2 text-center font-semibold text-slate-700 uppercase text-xs tracking-wider">Captain</th>
                    <th className="px-3 md:px-4 py-2 text-center font-semibold text-slate-700 uppercase text-xs tracking-wider">Vice</th>
                    <th className="px-3 md:px-4 py-2 text-center font-semibold text-slate-700 uppercase text-xs tracking-wider">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {players.map((player, idx) => (
                    <tr key={player.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <td className="px-3 md:px-4 py-3">
                        <p className="font-semibold text-slate-900">{player.name}</p>
                        <p className="text-xs text-slate-600">{player.team}</p>
                      </td>
                      <td className="hidden sm:table-cell px-3 md:px-4 py-3 text-center">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">{ROLE_LABELS[player.role]}</span>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-center font-bold text-slate-900 text-sm">{player.credits}</td>
                      <td className="px-3 md:px-4 py-3 text-center">
                        <button
                          onClick={() => onSetCaptain(player.id)}
                          disabled={isLocked}
                          className={`inline-flex items-center justify-center transition-all rounded px-2.5 py-1.5 text-xs font-semibold ${
                            captainId === player.id
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Set Captain"
                        >
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-center">
                        <button
                          onClick={() => onSetViceCaptain(player.id)}
                          disabled={isLocked}
                          className={`inline-flex items-center justify-center transition-all rounded px-2.5 py-1.5 text-xs font-semibold ${
                            viceCaptainId === player.id
                              ? 'bg-purple-500 text-white hover:bg-purple-600'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Set Vice Captain"
                        >
                          <Crown className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-center">
                        <button
                          onClick={() => onRemovePlayer(player.id)}
                          disabled={isLocked}
                          className={`inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded p-1.5 transition-all ${
                            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'
                          }`}
                          title="Remove player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-600 text-sm">Draft your first player →</p>
          </div>
        )}

        {isLocked && (
          <div className="fixed inset-0 bg-black/20 rounded-lg backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-8 text-center shadow-lg max-w-sm w-full">
              <Lock className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <p className="font-bold text-slate-900 text-lg">Match Locked</p>
              <p className="text-slate-600 text-sm mt-2">No further changes allowed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
