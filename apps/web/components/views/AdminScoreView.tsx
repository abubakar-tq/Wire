'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Loader, Save } from 'lucide-react';
import { scoreManagerAbi } from '@wirefluid/contracts';
import { contractAddresses } from '@/contracts/addresses';
import { useIndexedMatch, useIndexedMatches } from '@/api/useIndexerData';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { roleLabel, teamSideLabel } from '@/utils/arenaFormat';

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
  const match = useIndexedMatch(matchId);
  const writer = useArenaWriter();
  const [rows, setRows] = useState<StatRow[]>([]);

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

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 p-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Match ID</label>
          <input
            value={matchId}
            onChange={(event) => setMatchId(event.target.value)}
            placeholder="Match ID"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Players loaded</p>
          <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>
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
              return (
                <tr key={row.playerId}>
                  <td className="px-3 py-3 font-semibold text-slate-900">
                    Player {row.playerId}
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
        onClick={submitStats}
        disabled={writer.isSubmitting || rows.length === 0 || !matchId}
        className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50"
      >
        {writer.isSubmitting ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Submit Stats
      </button>

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
