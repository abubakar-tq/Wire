"use client";

import { useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, Lock, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { CricketPlayer, Squad } from '@/types/index';
import type { IndexedContest } from '@/api/indexerClient';
import { PlayerList } from '@/components/PlayerList';
import { formatWire } from '@/utils/arenaFormat';

interface ArenaViewProps {
  availablePlayers: CricketPlayer[];
  squad: Squad;
  creditsUsed: number;
  isSquadValid: boolean;
  matchStatus: string;
  activeMatchId?: string;
  activeMatchLabel?: string;
  onAddPlayer: (player: CricketPlayer) => void;
  onRemovePlayer: (playerId: string) => void;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  onClearSquad?: () => void;
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
  activeMatchId,
  activeMatchLabel,
  onAddPlayer,
  onRemovePlayer,
  onSetCaptain,
  onSetViceCaptain,
  onClearSquad,
  selectedContest,
  onJoinContest,
  isJoining = false,
  txHash,
  txError
}: ArenaViewProps) {
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPlayersOnMobile, setShowPlayersOnMobile] = useState(false);

  const creditsAvailable = 100 - creditsUsed;

  const grouped = useMemo(
    () => ({
      WK: squad.players.filter((player) => player.role === 'WK'),
      BAT: squad.players.filter((player) => player.role === 'BAT'),
      AR: squad.players.filter((player) => player.role === 'AR'),
      BOWL: squad.players.filter((player) => player.role === 'BOWL')
    }),
    [squad.players]
  );

  const openConfirm = () => {
    if (!isSquadValid) {
      setError('Squad must include 11 players with valid captain and vice-captain.');
      setTimeout(() => setError(null), 2500);
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="flex-1 grid grid-cols-1 xl:grid-cols-[22rem_minmax(0,1fr)] h-[calc(100vh-73px)] bg-white">
      <aside className="hidden xl:block border-r border-slate-200 overflow-y-auto">
        <PlayerList availablePlayers={availablePlayers} onSelectPlayer={onAddPlayer} creditsUsed={creditsUsed} />
      </aside>

      <section className="overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Squad Builder</p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">Build Match-Wise Squads</h1>
                <p className="text-sm text-slate-600 mt-1">
                  {activeMatchLabel ? `You are editing match #${activeMatchLabel}` : 'Select a contest to start.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Metric label="Players" value={`${squad.players.length}/11`} tone={squad.players.length === 11 ? 'good' : 'normal'} />
                <Metric label="Credits" value={`${creditsUsed}/100`} tone={creditsUsed <= 100 ? 'normal' : 'warn'} />
                <Metric label="State" value={isSquadValid ? 'Ready' : 'Draft'} tone={isSquadValid ? 'good' : 'normal'} />
              </div>
            </div>
          </div>

          <div className="xl:hidden">
            <button
              onClick={() => setShowPlayersOnMobile((prev) => !prev)}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            >
              <span>Available Players</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPlayersOnMobile ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showPlayersOnMobile ? (
            <div className="xl:hidden rounded-xl border border-slate-200 overflow-hidden">
              <PlayerList availablePlayers={availablePlayers} onSelectPlayer={onAddPlayer} creditsUsed={creditsUsed} />
            </div>
          ) : null}

          {matchStatus === 'LOCKED' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Match locked: squad can be reviewed but not edited.</span>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-5">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">Current Match Squad</h2>
                    <p className="text-xs text-slate-500">Saved separately for match #{activeMatchId ?? 'n/a'}</p>
                  </div>
                  <button
                    onClick={onClearSquad}
                    disabled={squad.players.length === 0}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <RoleGroup title="Wicket Keepers" players={grouped.WK} squad={squad} matchStatus={matchStatus} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} onRemovePlayer={onRemovePlayer} />
                  <RoleGroup title="Batters" players={grouped.BAT} squad={squad} matchStatus={matchStatus} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} onRemovePlayer={onRemovePlayer} />
                  <RoleGroup title="All-Rounders" players={grouped.AR} squad={squad} matchStatus={matchStatus} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} onRemovePlayer={onRemovePlayer} />
                  <RoleGroup title="Bowlers" players={grouped.BOWL} squad={squad} matchStatus={matchStatus} onSetCaptain={onSetCaptain} onSetViceCaptain={onSetViceCaptain} onRemovePlayer={onRemovePlayer} />
                </div>
              </div>

              {squad.players.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Plus className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-slate-700">No players selected for this match</p>
                  <p className="text-sm text-slate-500">Open the player panel and add your first pick.</p>
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contest</p>
                <p className="text-lg font-bold text-slate-900">{selectedContest ? `#${selectedContest.contestId}` : 'No Open Contest'}</p>
                <DataRow label="Match" value={selectedContest ? `#${selectedContest.matchId}` : '—'} />
                <DataRow label="Entry fee" value={selectedContest ? formatWire(selectedContest.entryFee) : '—'} />
                <DataRow label="Entries" value={selectedContest ? `${selectedContest.totalEntries}/${selectedContest.maxEntries}` : '—'} />
                <DataRow label="Credits left" value={`${creditsAvailable}`} />
              </div>

              <button
                onClick={openConfirm}
                disabled={!isSquadValid || matchStatus === 'LOCKED' || !selectedContest || isJoining}
                className={`w-full rounded-xl px-4 py-3 font-semibold text-white ${
                  isSquadValid && matchStatus !== 'LOCKED' && selectedContest && !isJoining
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {isJoining ? 'Joining Contest...' : 'Review And Join'}
              </button>

              {txHash ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 break-all">Tx: {txHash}</div> : null}
              {txError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{txError}</div> : null}
            </aside>
          </div>
        </div>
      </section>

      {showConfirm ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-slate-900" />
              <h2 className="text-xl font-bold text-slate-900">Confirm Contest Entry</h2>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
              <DataRow label="Match" value={`#${activeMatchLabel ?? activeMatchId ?? 'n/a'}`} />
              <DataRow label="Players" value={`${squad.players.length}/11`} />
              <DataRow label="Captain" value={squad.players.find((p) => p.id === squad.captainId)?.name ?? 'Not selected'} />
              <DataRow label="Vice captain" value={squad.players.find((p) => p.id === squad.viceCaptainId)?.name ?? 'Not selected'} />
              <DataRow label="Contest" value={selectedContest ? `#${selectedContest.contestId}` : 'Unavailable'} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (onJoinContest) await onJoinContest();
                  setShowConfirm(false);
                }}
                disabled={!onJoinContest || isJoining}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isJoining ? 'Waiting...' : 'Confirm Join'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'normal' | 'good' | 'warn' }) {
  const toneMap = {
    normal: 'bg-white border-slate-200 text-slate-900',
    good: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warn: 'bg-amber-50 border-amber-200 text-amber-700'
  } as const;

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneMap[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-base font-bold mt-1">{value}</p>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function RoleGroup({
  title,
  players,
  squad,
  matchStatus,
  onSetCaptain,
  onSetViceCaptain,
  onRemovePlayer
}: {
  title: string;
  players: CricketPlayer[];
  squad: Squad;
  matchStatus: string;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">{players.length}</span>
      </div>

      {players.length === 0 ? (
        <p className="px-3 py-3 text-sm text-slate-500">No players selected.</p>
      ) : (
        <div className="divide-y divide-slate-200">
          {players.map((player) => {
            const captain = squad.captainId === player.id;
            const viceCaptain = squad.viceCaptainId === player.id;
            return (
              <div key={player.id} className="px-3 py-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                  {player.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{player.name}</p>
                  <p className="text-xs text-slate-500">{player.team} • {player.credits} credits</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSetCaptain(player.id)}
                    disabled={matchStatus === 'LOCKED'}
                    className={`rounded px-2 py-1 text-xs font-semibold ${captain ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    C
                  </button>
                  <button
                    onClick={() => onSetViceCaptain(player.id)}
                    disabled={matchStatus === 'LOCKED'}
                    className={`rounded px-2 py-1 text-xs font-semibold ${viceCaptain ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    VC
                  </button>
                  <button
                    onClick={() => onRemovePlayer(player.id)}
                    disabled={matchStatus === 'LOCKED'}
                    className="rounded p-1 text-red-600 hover:bg-red-50"
                    aria-label={`Remove ${player.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
