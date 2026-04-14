'use client';

import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { CricketPlayer } from '@/types/index';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ROLE_LABELS: Record<string, string> = {
  WK: 'Wicket Keeper',
  BAT: 'Batter',
  AR: 'All-rounder',
  BOWL: 'Bowler',
};

interface PlayerListProps {
  availablePlayers: CricketPlayer[];
  onSelectPlayer: (player: CricketPlayer) => void;
  creditsUsed: number;
}

export function PlayerList({ availablePlayers, onSelectPlayer, creditsUsed }: PlayerListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const teams = useMemo(() => {
    return [...new Set(availablePlayers.map((player) => player.team))].sort((a, b) => a.localeCompare(b));
  }, [availablePlayers]);

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !selectedRole || player.role === selectedRole;
      const matchesTeam = !selectedTeam || player.team === selectedTeam;
      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [availablePlayers, searchQuery, selectedRole, selectedTeam]);

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-white border-r border-slate-200 p-3 md:p-4 overflow-y-auto">
      <h2 className="text-base md:text-lg font-bold text-slate-900 mb-3">Available Players</h2>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
      </div>

      {/* Role Filter */}
      <div className="mb-2.5">
        <p className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Role</p>
        <div className="flex gap-1.5 flex-wrap">
          {['WK', 'BAT', 'AR', 'BOWL'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                selectedRole === role
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Team Filter */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Team</p>
        <div className="flex gap-1 flex-wrap">
          {teams.map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(selectedTeam === team ? null : team)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                selectedTeam === team ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {team}
            </button>
          ))}
        </div>
      </div>

      {/* Budget Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3">
        <p className="text-xs text-slate-600 mb-1 font-semibold uppercase tracking-wide">Credits Used</p>
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-lg font-bold text-slate-900 tabular-nums">{creditsUsed}</span>
          <span className="text-xs text-slate-600">/ 100</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div className="bg-teal-600 h-1.5 rounded-full transition-all" style={{ width: `${creditsUsed}%` }} />
        </div>
      </div>

      {/* Players List - Compact */}
      <div className="space-y-1.5">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              className="w-full text-left p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition-all active:scale-95"
            >
              <div className="flex items-start gap-2 mb-1">
                <Avatar className="size-9">
                  {player.imageUrl ? <AvatarImage src={player.imageUrl} alt={player.name} /> : null}
                  <AvatarFallback className="bg-slate-900 text-white text-xs font-semibold">
                    {player.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-xs md:text-sm truncate">{player.name}</p>
                  <p className="text-xs text-slate-600">{ROLE_LABELS[player.role]}</p>
                </div>
                <Plus className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  {player.team}
                </span>
                <span className="text-xs font-bold text-slate-900">{player.credits}C</span>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-slate-600 text-xs">No matching players</p>
          </div>
        )}
      </div>
    </div>
  );
}
