'use client';

import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { CricketPlayer } from '@/types/index';
import { TEAM_COLORS, ROLE_LABELS } from '@/lib/mock-data';

interface PlayerListProps {
  availablePlayers: CricketPlayer[];
  onSelectPlayer: (player: CricketPlayer) => void;
  creditsUsed: number;
}

export function PlayerList({ availablePlayers, onSelectPlayer, creditsUsed }: PlayerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !selectedRole || player.role === selectedRole;
      const matchesTeam = !selectedTeam || player.team === selectedTeam;
      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [availablePlayers, searchQuery, selectedRole, selectedTeam]);

  return (
    <div className="w-96 bg-white border-r border-[#E5E7EB] p-6 overflow-y-auto h-[calc(100vh-73px)]">
      <h2 className="text-lg font-bold text-[#0F1117] mb-4">Available Players</h2>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-[#4B5563]" />
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] text-[#0F1117] placeholder-[#4B5563] text-sm"
        />
      </div>

      {/* Role Filter */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-[#4B5563] mb-2">ROLE</p>
        <div className="flex gap-2 flex-wrap">
          {['WK', 'BAT', 'AR', 'BOWL'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedRole === role
                  ? 'bg-[#10B981] text-white'
                  : 'bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Team Filter */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-[#4B5563] mb-2">TEAM</p>
        <div className="flex gap-2 flex-wrap">
          {['KK', 'LQ', 'IU', 'PZ', 'MS', 'QG'].map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedTeam === team ? 'bg-[#2563EB] text-white' : 'bg-[#E5E7EB] text-[#4B5563] hover:bg-[#D1D5DB]'
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Info */}
      <div className="bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg p-3 mb-4">
        <p className="text-xs text-[#4B5563] mb-1">TOTAL CREDITS</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-[#0F1117] tabular-nums">{creditsUsed}</span>
          <span className="text-sm text-[#4B5563]">/ 100</span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-2 mt-2">
          <div className="bg-[#10B981] h-2 rounded-full transition-all" style={{ width: `${creditsUsed}%` }} />
        </div>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              className="w-full text-left p-3 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#FAFAFA] hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-[#0F1117] text-sm">{player.name}</p>
                  <p className="text-xs text-[#4B5563]">{ROLE_LABELS[player.role]}</p>
                </div>
                <Plus className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="flex items-center justify-between">
                <span className={`${TEAM_COLORS[player.team]} text-white text-xs px-2 py-1 rounded font-medium`}>
                  {player.team}
                </span>
                <span className="text-sm font-bold text-[#0F1117]">{player.credits}C</span>
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="text-[#4B5563]">Sel: {player.selPct}%</span>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-[#4B5563] text-sm">No players match filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
