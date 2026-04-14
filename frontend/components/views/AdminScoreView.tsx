'use client';

import { useState } from 'react';
import { Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { CricketPlayer } from '@/types/index';
import { CRICKET_PLAYERS } from '@/lib/mock-data';

interface AdminScoreViewProps {
  onUpdateScore: (playerId: string, points: number) => void;
}

interface PlayerScore {
  id: string;
  name: string;
  runs: number;
  fours: number;
  sixes: number;
  wickets: number;
  catches: number;
  calculatedPoints: number;
}

export function AdminScoreView({ onUpdateScore }: AdminScoreViewProps) {
  // Mock initial scores for demo
  const initialScores = CRICKET_PLAYERS.slice(0, 12).map((p) => {
    const mockRuns = Math.floor(Math.random() * 80);
    const mockFours = Math.floor(Math.random() * 8);
    const mockSixes = Math.floor(Math.random() * 4);
    const mockWickets = Math.floor(Math.random() * 3);
    const mockCatches = Math.floor(Math.random() * 3);

    return {
      id: p.id,
      name: p.name,
      runs: mockRuns,
      fours: mockFours,
      sixes: mockSixes,
      wickets: mockWickets,
      catches: mockCatches,
      calculatedPoints: 0,
    };
  });

  const [playerScores, setPlayerScores] = useState<PlayerScore[]>(
    initialScores.map((score) => ({
      ...score,
      calculatedPoints: 
        score.runs * 1 +
        score.fours * 1 +
        score.sixes * 2 +
        score.wickets * 25 +
        score.catches * 8,
    }))
  );

  const [pushState, setPushState] = useState<'IDLE' | 'MODAL' | 'CONFIRMING' | 'BROADCASTING' | 'SUCCESS'>('IDLE');
  const [confirmText, setConfirmText] = useState('');

  const calculatePoints = (score: PlayerScore): number => {
    let points = 0;

    // Batting: 1 point per run
    points += score.runs * 1;

    // Batting bonuses
    points += score.fours * 1; // Extra for boundaries
    points += score.sixes * 2; // Extra for sixes

    // Bowling: 25 points per wicket
    points += score.wickets * 25;

    // Fielding: 8 points per catch
    points += score.catches * 8;

    return points;
  };

  const handleScoreChange = (id: string, field: keyof Omit<PlayerScore, 'id' | 'name' | 'calculatedPoints'>, value: number) => {
    setPlayerScores((prev) =>
      prev.map((ps) => {
        if (ps.id === id) {
          const updated = { ...ps, [field]: value };
          updated.calculatedPoints = calculatePoints(updated);
          return updated;
        }
        return ps;
      })
    );
  };

  const handlePushToChain = () => {
    setPushState('MODAL');
  };

  const handleConfirm = async () => {
    if (confirmText !== 'CONFIRM') return;

    setPushState('CONFIRMING');
    await new Promise((r) => setTimeout(r, 500));

    setPushState('BROADCASTING');
    await new Promise((r) => setTimeout(r, 1500));

    // Update scores
    playerScores.forEach((score) => {
      onUpdateScore(score.id, score.calculatedPoints);
    });

    setPushState('SUCCESS');
    await new Promise((r) => setTimeout(r, 2000));

    // Reset
    setPushState('IDLE');
    setConfirmText('');
    setPlayerScores((prev) =>
      prev.map((p) => ({
        ...p,
        runs: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        catches: 0,
        calculatedPoints: 0,
      }))
    );
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">Score Management</h1>
        <p className="text-[#4B5563]">Update live player statistics and push to blockchain</p>
      </div>

      {/* Live Calculation Info */}
      <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 rounded-lg p-4 mb-6">
        <p className="text-sm text-[#0F1117]">
          <strong>Scoring Formula:</strong> Runs (1pt) + Fours (1pt) + Sixes (2pts) + Wickets (25pts) + Catches (8pts)
        </p>
      </div>

      {/* Score Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#0F1117] sticky left-0 bg-[#FAFAFA]">Player</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Runs</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">4s</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">6s</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Wickets</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Catches</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Points</th>
            </tr>
          </thead>
          <tbody>
            {playerScores.map((score, idx) => (
              <tr key={score.id} className={`border-b border-[#E5E7EB] ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                <td className="px-6 py-4 text-[#0F1117] font-semibold sticky left-0 bg-inherit">{score.name}</td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    value={score.runs}
                    onChange={(e) => handleScoreChange(score.id, 'runs', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 rounded border border-[#E5E7EB] text-center text-[#0F1117]"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    value={score.fours}
                    onChange={(e) => handleScoreChange(score.id, 'fours', parseInt(e.target.value) || 0)}
                    className="w-12 px-2 py-1 rounded border border-[#E5E7EB] text-center text-[#0F1117]"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    value={score.sixes}
                    onChange={(e) => handleScoreChange(score.id, 'sixes', parseInt(e.target.value) || 0)}
                    className="w-12 px-2 py-1 rounded border border-[#E5E7EB] text-center text-[#0F1117]"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    value={score.wickets}
                    onChange={(e) => handleScoreChange(score.id, 'wickets', parseInt(e.target.value) || 0)}
                    className="w-12 px-2 py-1 rounded border border-[#E5E7EB] text-center text-[#0F1117]"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="number"
                    min="0"
                    value={score.catches}
                    onChange={(e) => handleScoreChange(score.id, 'catches', parseInt(e.target.value) || 0)}
                    className="w-12 px-2 py-1 rounded border border-[#E5E7EB] text-center text-[#0F1117]"
                  />
                </td>
                <td className="px-6 py-4 text-center font-bold text-[#10B981]">{score.calculatedPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Push Button */}
      <button
        onClick={handlePushToChain}
        className="mt-8 w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Save className="w-5 h-5" />
        Push to Chain
      </button>

      {/* Confirmation Modal */}
      {pushState === 'MODAL' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#EF4444]" />
              <h2 className="text-xl font-bold text-[#0F1117]">Confirm Push</h2>
            </div>
            <p className="text-[#4B5563] mb-6">
              This action will push all score updates to the blockchain. This cannot be undone. Type <strong>CONFIRM</strong> to proceed.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type CONFIRM"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] mb-6 text-[#0F1117]"
            />
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                disabled={confirmText !== 'CONFIRM'}
                className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Push to Chain
              </button>
              <button
                onClick={() => {
                  setPushState('IDLE');
                  setConfirmText('');
                }}
                className="w-full bg-[#E5E7EB] text-[#0F1117] font-bold py-3 px-4 rounded-xl transition-all hover:bg-[#D1D5DB]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasting State */}
      {pushState === 'BROADCASTING' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <Loader className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F1117]">Broadcasting</h2>
            <p className="text-[#4B5563] text-sm mt-2">Pushing scores to blockchain...</p>
          </div>
        </div>
      )}

      {/* Success State */}
      {pushState === 'SUCCESS' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
            <CheckCircle className="w-12 h-12 text-[#10B981] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#0F1117]">Success!</h2>
            <p className="text-[#4B5563] text-sm mt-2">Scores have been pushed to blockchain</p>
            <p className="text-xs text-[#4B5563] mt-4">Returning to leaderboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
