'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Save } from 'lucide-react';
import { scoreManagerAbi } from '@wirefluid/contracts';
import { contractAddresses } from '@/contracts/addresses';
import { useIndexedMatches, useMatchData } from '@/api/useIndexerData';
import { usePlayerProfiles } from '@/api/usePlayerProfiles';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { roleLabel, safePlayerName, statusLabel, teamSideLabel } from '@/utils/arenaFormat';
import { formatRelativeTime } from '@/utils/liveTime';
import { useNow } from '@/hooks/useNow';

interface AdminScoreViewProps {
  onUpdateScore: (playerId: string, points: number) => void;
}

type StatRow = {
  playerId: number;
  runs: number;
  fours: number;
  sixes: number;
  wickets: number;
  maidens: number;
  catches: number;
  stumpings: number;
  runOutDirect: number;
  runOutIndirect: number;
  duck: boolean;
  inStartingXI: boolean;
  substituteAppearance: boolean;
};

const emptyRow = (playerId: number): StatRow => ({
  playerId,
  runs: 0,
  fours: 0,
  sixes: 0,
  wickets: 0,
  maidens: 0,
  catches: 0,
  stumpings: 0,
  runOutDirect: 0,
  runOutIndirect: 0,
  duck: false,
  inStartingXI: true,
  substituteAppearance: false
});

export function AdminScoreView({ onUpdateScore }: AdminScoreViewProps) {
  const matches = useIndexedMatches();
  const defaultMatchId = matches.data?.[0]?.matchId ?? '';
  const [matchId, setMatchId] = useState(defaultMatchId);
  const matchOptions = matches.data ?? [];
  const match = useMatchData(matchId);
  const writer = useArenaWriter();
  const now = useNow();
  const [rows, setRows] = useState<StatRow[]>([]);
  const playerIds = useMemo(() => (match.data?.players ?? []).map((player) => player.playerId), [match.data?.players]);
  const profiles = usePlayerProfiles(playerIds);
  const profilesById = useMemo(
    () => new Map((profiles.data ?? []).map((profile) => [profile.playerId, profile])),
    [profiles.data]
  );
  
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    if (!defaultMatchId || matchId) return;
    setMatchId(defaultMatchId);
  }, [defaultMatchId, matchId]);

  useEffect(() => {
    const players = match.data?.players ?? [];
    setRows(players.map((player) => emptyRow(player.playerId)));
  }, [match.data?.players]);

  const pointsPreview = useMemo(() => rows.map((row) => [row.playerId, calculatePoints(row)] as const), [rows]);

  const updateRow = (playerId: number, field: keyof StatRow, value: number | boolean) => {
    setRows((current) =>
      current.map((row) => (row.playerId === playerId ? { ...row, [field]: value } : row))
    );
  };

  const handleImportJson = () => {
    setImportError('');
    if (!importJsonText.trim()) return;
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed)) throw new Error('JSON root must be an array of player objects');

      setRows((current) => current.map((row) => {
        const imported = parsed.find((p: any) => Number(p.playerId) === row.playerId);
        if (!imported) return row;
        return {
          ...row,
          runs: Number(imported.runs ?? row.runs),
          fours: Number(imported.fours ?? row.fours),
          sixes: Number(imported.sixes ?? row.sixes),
          wickets: Number(imported.wickets ?? row.wickets),
          maidens: Number(imported.maidens ?? row.maidens),
          catches: Number(imported.catches ?? row.catches),
          stumpings: Number(imported.stumpings ?? row.stumpings),
          runOutDirect: Number(imported.runOutDirect ?? row.runOutDirect),
          runOutIndirect: Number(imported.runOutIndirect ?? row.runOutIndirect),
          duck: Boolean(imported.duck ?? row.duck),
          inStartingXI: Boolean(imported.inStartingXI ?? row.inStartingXI),
          substituteAppearance: Boolean(imported.substituteAppearance ?? row.substituteAppearance),
        };
      }));
      setImportJsonText('');
      alert("Scores imported successfully!");
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };

  const submitStats = async () => {
    await writer.write({
      address: contractAddresses.scoreManager,
      abi: scoreManagerAbi,
      functionName: 'submitMatchStats',
      args: [
        BigInt(matchId),
        rows.map((row) => row.playerId),
        rows.map((row) => ({
          runs: row.runs,
          fours: row.fours,
          sixes: row.sixes,
          wickets: row.wickets,
          maidens: row.maidens,
          catches: row.catches,
          stumpings: row.stumpings,
          runOutDirect: row.runOutDirect,
          runOutIndirect: row.runOutIndirect,
          duck: row.duck,
          inStartingXI: row.inStartingXI,
          substituteAppearance: row.substituteAppearance
        }))
      ]
    });
    for (const [playerId, points] of pointsPreview) {
      onUpdateScore(playerId.toString(), points);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Score Publisher</h1>
        <p className="text-slate-600">Submit raw cricket stats once per match</p>
      </div>

      {writer.rpcChainId && writer.configuredChainId && writer.rpcChainId !== writer.configuredChainId && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          RPC chain ID {writer.rpcChainId} does not match the configured chain ID {writer.configuredChainId}. Update your env or restart Anvil with the correct chain ID.
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Match</label>
          <select
            value={matchOptions.some((option) => option.matchId === matchId) ? matchId : ''}
            onChange={(event) => setMatchId(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Custom match ID</option>
            {matchOptions.map((option) => (
              <option key={option.matchId} value={option.matchId}>
                #{option.matchId} · {statusLabel(option.status)} · lock {formatRelativeTime(option.lockTime, now)}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-semibold text-slate-600">Manual match ID</label>
          <input
            value={matchId}
            onChange={(event) => setMatchId(event.target.value)}
            placeholder="Match ID"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Players loaded</p>
          <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 p-4 bg-slate-50">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Bulk Import Scores (JSON)</label>
        <p className="text-xs text-slate-500 mb-2">
          Paste an array of JSON objects. E.g. <code className="bg-slate-200 px-1 rounded">{`[{"playerId": 1, "runs": 50, "wickets": 2}]`}</code>
        </p>
        <textarea
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          placeholder="Paste JSON here..."
          className="w-full h-24 rounded-lg border border-slate-200 p-3 font-mono text-xs mb-2"
        />
        {importError && <p className="text-xs text-red-600 mb-2">{importError}</p>}
        <button
          onClick={handleImportJson}
          className="rounded bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 text-xs font-semibold"
        >
          Import JSON
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-900">
          Stats submission is final on-chain. Missing allowed players keep zero points.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-3 text-left">Player</th>
              {['Runs', '4s', '6s', 'Wkts', 'Maidens', 'Catches', 'Stump', 'RO D', 'RO I', 'Duck', 'XI', 'Sub', 'Pts'].map((head) => (
                <th key={head} className="px-3 py-3 text-center">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const meta = match.data?.players.find((player) => player.playerId === row.playerId);
              const displayName = profilesById.get(row.playerId)?.name ?? safePlayerName(row.playerId);
              return (
                <tr key={row.playerId}>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{displayName}</span>
                      <span className="text-xs text-slate-500">#{row.playerId}</span>
                    </div>
                    {meta && <p className="text-xs text-slate-500">{roleLabel(meta.role)} · {teamSideLabel(meta.teamSide)}</p>}
                  </td>
                  {(['runs', 'fours', 'sixes', 'wickets', 'maidens', 'catches', 'stumpings', 'runOutDirect', 'runOutIndirect'] as const).map((field) => (
                    <td key={field} className="px-3 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={row[field]}
                        onChange={(event) => updateRow(row.playerId, field, Number(event.target.value) || 0)}
                        className="w-16 rounded border border-slate-200 px-2 py-1 text-center"
                      />
                    </td>
                  ))}
                  {(['duck', 'inStartingXI', 'substituteAppearance'] as const).map((field) => (
                    <td key={field} className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={row[field]}
                        onChange={(event) => updateRow(row.playerId, field, event.target.checked)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center font-bold text-emerald-700">{calculatePoints(row)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} className="px-4 py-10 text-center text-slate-500">
                  Select a match with an indexed player pool.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => {
          void submitStats().catch(() => {});
        }}
        disabled={writer.isBusy || rows.length === 0 || !matchId}
        className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50"
      >
        {writer.isBusy ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Submit Stats
      </button>

      {writer.isConfirming && writer.hash && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Transaction is confirming</p>
          <p className="mt-1 break-all">{writer.hash}</p>
          <button
            onClick={writer.reset}
            className="mt-3 rounded border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
          >
            Clear Pending State
          </button>
        </div>
      )}

      {writer.isConfirmed && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-sm text-emerald-800">
          <CheckCircle className="w-4 h-4" />
          Stats transaction confirmed.
        </div>
      )}
      {writer.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{writer.error}</span>
        </div>
      )}
    </div>
  );
}

function calculatePoints(row: StatRow): number {
  let points = 0;
  points += row.inStartingXI ? 4 : 0;
  points += row.substituteAppearance ? 2 : 0;
  points += row.runs;
  points += row.fours;
  points += row.sixes * 2;
  points += row.wickets * 25;
  points += row.maidens * 12;
  points += row.catches * 8;
  points += row.stumpings * 12;
  points += row.runOutDirect * 12;
  points += row.runOutIndirect * 6;
  points -= row.duck ? 2 : 0;
  return points;
}
