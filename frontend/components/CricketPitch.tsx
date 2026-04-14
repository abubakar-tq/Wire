'use client';

import { X, Crown } from 'lucide-react';
import { CricketPlayer } from '@/types/index';
import { TEAM_COLORS, ROLE_LABELS } from '@/lib/mock-data';

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
    <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0F1117] mb-2">Your Squad</h2>
        <p className="text-[#4B5563]">
          {players.length} / 11 Players • {captainId && viceCaptainId ? '✓ C & VC Set' : '⚠ Set Captain & Vice'}
        </p>
      </div>

      {/* Pitch Visualization */}
      <div className="bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/5 rounded-xl border-2 border-[#10B981] p-8 mb-8">
        <div className="aspect-video max-w-2xl mx-auto relative bg-white rounded-lg border-2 border-dashed border-[#10B981]/30 overflow-hidden">
          {/* Cricket Field Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
            <ellipse cx="200" cy="125" rx="150" ry="80" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.3" />
            <line x1="200" y1="30" x2="200" y2="220" stroke="#10B981" strokeWidth="1" opacity="0.2" />
            <circle cx="200" cy="125" r="30" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.2" />
          </svg>

          {/* Player Positions */}
          <div className="relative w-full h-full p-4">
            {/* Wicket Keepers */}
            {roleGroups.WK.length > 0 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <p className="text-xs font-semibold text-[#4B5563] mb-2 text-center">WK</p>
                <div className="flex gap-2">
                  {roleGroups.WK.map((player) => (
                    <div
                      key={player.id}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ${TEAM_COLORS[player.team]}`}
                      title={player.name}
                    >
                      {player.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Batters */}
            {roleGroups.BAT.length > 0 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <p className="text-xs font-semibold text-[#4B5563] mb-2">BAT</p>
                <div className="flex flex-col gap-2">
                  {roleGroups.BAT.slice(0, 3).map((player) => (
                    <div
                      key={player.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${TEAM_COLORS[player.team]}`}
                      title={player.name}
                    >
                      {player.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All-rounders */}
            {roleGroups.AR.length > 0 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <p className="text-xs font-semibold text-[#4B5563] mb-2 text-right">AR</p>
                <div className="flex flex-col gap-2">
                  {roleGroups.AR.slice(0, 3).map((player) => (
                    <div
                      key={player.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${TEAM_COLORS[player.team]}`}
                      title={player.name}
                    >
                      {player.name.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bowlers */}
            {roleGroups.BOWL.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <p className="text-xs font-semibold text-[#4B5563] mb-2 text-center">BOWL</p>
                <div className="flex gap-2">
                  {roleGroups.BOWL.slice(0, 4).map((player) => (
                    <div
                      key={player.id}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${TEAM_COLORS[player.team]}`}
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

      {/* Players Table */}
      {players.length > 0 ? (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Player</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Role</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Credits</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Captain</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Vice</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]"></th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={player.id} className={`border-b border-[#E5E7EB] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-[#0F1117]">{player.name}</p>
                      <p className="text-xs text-[#4B5563]">{player.team}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#4B5563]">{ROLE_LABELS[player.role]}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-[#0F1117]">{player.credits}C</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSetCaptain(player.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center transition-all ${
                        captainId === player.id
                          ? 'bg-[#F5A623] text-white'
                          : 'bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} rounded-lg px-3 py-2`}
                    >
                      <Crown className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onSetViceCaptain(player.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center transition-all ${
                        viceCaptainId === player.id
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''} rounded-lg px-3 py-2`}
                    >
                      <Crown className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onRemovePlayer(player.id)}
                      disabled={isLocked}
                      className={`inline-flex items-center justify-center text-[#EF4444] hover:bg-red-50 rounded-lg p-2 transition-all ${
                        isLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]">
          <p className="text-[#4B5563]">Draft your first player →</p>
        </div>
      )}

      {isLocked && (
        <div className="fixed inset-0 bg-black/20 rounded-lg backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="font-bold text-[#0F1117] text-lg">Match Locked</p>
            <p className="text-[#4B5563] text-sm mt-2">No further changes allowed</p>
          </div>
        </div>
      )}
    </div>
  );
}
