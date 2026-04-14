'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Sparkles, Lock } from 'lucide-react';
import { CricketPlayer, Squad } from '@/types/index';
import { PlayerList } from '@/components/PlayerList';
import { CricketPitch } from '@/components/CricketPitch';
import { AIInsightCard } from '@/components/AIInsightCard';
import { NFTPreviewCard } from '@/components/NFTPreviewCard';

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
}: ArenaViewProps) {
  const [showNFTPreview, setShowNFTPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-73px)] gap-0">
      {/* Left: Player List */}
      <PlayerList availablePlayers={availablePlayers} onSelectPlayer={onAddPlayer} creditsUsed={creditsUsed} />

      {/* Right: Squad Builder & Controls */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-[#FAFAFA] to-[#F0FDF4]/30">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {/* Error Message - Animated */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-[#EF4444] rounded-xl flex items-start gap-3 animate-slide-down shadow-card">
              <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#EF4444] font-medium">{error}</p>
            </div>
          )}

          {/* AI Insight */}
          <div className="animate-fade-in-up mb-6">
            <AIInsightCard onGetInsight={() => ''} />
          </div>

          {/* Squad Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { 
                label: 'Squad Size', 
                value: squad.players.length, 
                max: 11, 
                color: '#8B5CF6',
                icon: '👥'
              },
              { 
                label: 'Credits Used', 
                value: creditsUsed, 
                max: 100, 
                color: '#F5A623',
                icon: '💰',
                subtext: `${creditsAvailable} available`
              },
              { 
                label: 'Squad Status', 
                value: isSquadValid ? 'Valid' : 'Incomplete', 
                color: isSquadValid ? '#10B981' : '#5B6B7A',
                icon: isSquadValid ? '✓' : '○'
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-5 border transition-smooth group hover:shadow-elevated ${
                  stat.label === 'Squad Status'
                    ? isSquadValid
                      ? 'bg-gradient-to-br from-[#10B981]/10 to-transparent border-[#10B981]/30 hover:border-[#10B981]/60'
                      : 'bg-[#FAFAFA] border-[#E5E7EB]'
                    : 'bg-white border-[#E5E7EB] hover:border-[#10B981]/30'
                }`}
                style={{
                  animation: `fadeInUp 0.4s ease-out ${idx * 100}ms forwards`,
                  opacity: 0,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-xs font-bold text-[#5B6B7A] uppercase">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold tabular-nums`} style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  {stat.max && <span className="text-sm text-[#5B6B7A]">/ {stat.max}</span>}
                </div>
                {stat.subtext && <p className="text-xs text-[#5B6B7A] mt-2">{stat.subtext}</p>}
                {stat.max && (
                  <div className="mt-3 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300`}
                      style={{
                        width: `${(stat.value / stat.max) * 100}%`,
                        backgroundColor: stat.color,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Match Locked Warning */}
          {matchStatus === 'LOCKED' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-[#F5A623]/30 rounded-xl flex items-start gap-3 animate-pulse">
              <Lock className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#0F1117]">
                <span className="font-bold">Match Locked</span> - You cannot modify your squad once the match has started.
              </p>
            </div>
          )}

          {/* NFT Preview Card */}
          {isSquadValid && (
            <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <NFTPreviewCard squadName="My Arena" captainName={squad.players.find((p) => p.id === squad.captainId)?.name || ''} />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={handleMintNFT}
              disabled={!isSquadValid || matchStatus === 'LOCKED'}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-smooth flex items-center justify-center gap-2 ${
                isSquadValid && matchStatus !== 'LOCKED'
                  ? 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-elevated text-white hover:scale-[1.02] active:scale-[0.98] shadow-card'
                  : 'bg-[#E5E7EB] text-[#5B6B7A] cursor-not-allowed opacity-50'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Mint Squad NFT
            </button>

            <button
              className="w-full py-3 px-6 rounded-xl font-semibold border border-[#E5E7EB] bg-white text-[#0F1117] hover:bg-[#FAFAFA] transition-smooth"
            >
              Save as Template
            </button>
          </div>

          <div className="h-8" />
        </div>
      </div>

      {/* Center: Cricket Pitch */}
      <CricketPitch
        players={squad.players}
        captainId={squad.captainId}
        viceCaptainId={squad.viceCaptainId}
        onRemovePlayer={onRemovePlayer}
        onSetCaptain={onSetCaptain}
        onSetViceCaptain={onSetViceCaptain}
        matchStatus={matchStatus}
      />

      {/* NFT Mint Modal */}
      {showNFTPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-hover animate-scale-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-2xl font-bold text-[#0F1117]">Squad NFT Ready</h2>
            </div>
            <p className="text-[#5B6B7A] text-sm mb-8">Your optimized squad is ready to be minted as a blockchain asset</p>

            <div className="bg-gradient-to-br from-[#10B981]/10 via-[#2563EB]/5 to-[#8B5CF6]/10 rounded-xl p-6 mb-8 border border-[#10B981]/20">
              <div className="text-center space-y-4">
                <p className="text-sm text-[#5B6B7A] font-medium">SQUAD ID</p>
                <p className="text-4xl font-black text-[#0F1117]">#2841</p>
                <p className="text-lg font-bold text-[#0F1117]">My Arena</p>

                <div className="bg-white rounded-lg p-5 border-2 border-dashed border-[#10B981] space-y-2">
                  <p className="text-xs text-[#5B6B7A] uppercase font-bold">Captain</p>
                  <p className="font-bold text-[#0F1117] text-lg">{squad.players.find((p) => p.id === squad.captainId)?.name || 'N/A'}</p>
                  <p className="text-xs text-[#5B6B7A]">2x Points Multiplier</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded p-2 border border-[#E5E7EB]">
                    <p className="text-xs text-[#5B6B7A]">Players</p>
                    <p className="font-bold text-[#0F1117]">{squad.players.length}</p>
                  </div>
                  <div className="bg-white rounded p-2 border border-[#E5E7EB]">
                    <p className="text-xs text-[#5B6B7A]">Credits</p>
                    <p className="font-bold text-[#0F1117]">{creditsUsed}/100</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={async () => {
                  await new Promise((r) => setTimeout(r, 1200));
                  setShowNFTPreview(false);
                }}
                className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:shadow-elevated text-white font-bold py-4 px-4 rounded-xl transition-smooth hover:scale-[1.02] active:scale-[0.98] shadow-card"
              >
                Complete Mint
              </button>
              <button
                onClick={() => setShowNFTPreview(false)}
                className="w-full bg-[#FAFAFA] hover:bg-white text-[#0F1117] font-semibold py-3 px-4 rounded-xl transition-smooth border border-[#E5E7EB] hover:border-[#10B981]/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
