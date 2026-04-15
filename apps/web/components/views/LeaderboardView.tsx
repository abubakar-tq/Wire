'use client';

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, Flame, Medal } from 'lucide-react';
import { useAccount } from 'wagmi';
import { AppState } from '@/types/index';
import { addErc721ToWallet } from '@/utils/watchAsset';
import { contractAddresses } from '@/contracts/addresses';

interface LeaderboardViewProps {
  state: AppState;
  onLiveUpdate: () => void;
}

export function LeaderboardView({ state, onLiveUpdate }: LeaderboardViewProps) {
  const [animatingRanks, setAnimatingRanks] = useState<Set<string>>(new Set());
  const [showTop10Only, setShowTop10Only] = useState(true);
  const [addedSquads, setAddedSquads] = useState<Set<string>>(new Set());

  // Simulate live updates every 2-3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onLiveUpdate();
    }, Math.random() * 1000 + 2000);

    return () => clearInterval(interval);
  }, [onLiveUpdate]);

  useEffect(() => {
    const newAnimating = new Set<string>();
    state.leaderboard.forEach((entry) => {
      if (entry.change !== 0) {
        newAnimating.add(entry.userId);
      }
    });
    setAnimatingRanks(newAnimating);

    const timeout = setTimeout(() => setAnimatingRanks(new Set()), 600);
    return () => clearTimeout(timeout);
  }, [state.livePointsTick]);

  const { address } = useAccount();

  // Evaluate current user & Sort by points
  const sortedLeaderboard = [...state.leaderboard].map((entry) => ({
    ...entry,
    isCurrentUser: address ? entry.userId.toLowerCase() === address.toLowerCase() : false
  })).sort((a, b) => b.totalPoints - a.totalPoints);
  
  const displayedLeaderboard = showTop10Only ? sortedLeaderboard.slice(0, 10) : sortedLeaderboard;

  const currentUserEntry = sortedLeaderboard.find((e) => e.isCurrentUser);
  const maxPoints = Math.max(...sortedLeaderboard.map((e) => e.totalPoints));

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-gradient-to-br from-[#FAFAFA] via-white to-[#F0FDF4]/30">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-[#EF4444] animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-[#0F1117]">Live Leaderboard</h1>
          </div>
          <p className="text-[#5B6B7A] text-lg">
            {state.matchStatus === 'LIVE' ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#EF4444] rounded-full animate-pulse"></span>
                LIVE • Points updating every 2-3 seconds
              </span>
            ) : (
              'Match scheduled'
            )}
          </p>
        </div>

        {/* Current User Highlight Card */}
        {currentUserEntry && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-gradient-to-r from-[#10B981]/10 via-[#059669]/5 to-transparent border-2 border-[#10B981]/30 rounded-xl p-6 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center text-white font-bold text-lg">
                  {sortedLeaderboard.findIndex((e) => e.isCurrentUser) + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#5B6B7A] uppercase">Your Position</p>
                  <h2 className="text-2xl font-bold text-[#0F1117]">{currentUserEntry.squadName}</h2>
                  <p className="text-sm text-[#5B6B7A] mt-1">{currentUserEntry.userName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#5B6B7A] uppercase">Points</p>
                  <p className="text-3xl font-bold text-[#10B981] tabular-nums">{currentUserEntry.totalPoints.toLocaleString()}</p>
                </div>
              </div>
              
              {currentUserEntry.tokenIds && currentUserEntry.tokenIds.length > 0 && (
                <div className="mt-5 pt-5 border-t border-[#10B981]/20 flex flex-col md:flex-row md:items-start gap-4">
                  <div className="max-w-xs pr-4 text-left border-r border-[#10B981]/10">
                    <h3 className="text-sm font-bold text-[#0F1117]">Your Squad Assets</h3>
                    <p className="mt-1 text-xs text-[#5B6B7A] leading-relaxed">
                      Import each of your on-chain Fantasy Squad NFTs directly into your wallet. The NFT dynamically tracks the points you scored with this specific 11-man lineup.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {currentUserEntry.tokenIds.map((tokenId) => {
                      const isAdded = addedSquads.has(tokenId);
                      return (
                        <button
                          key={tokenId}
                          disabled={isAdded}
                          onClick={async () => {
                            try {
                              const imgUrl = `https://api.dicebear.com/9.x/bottts-neutral/png?seed=squad-${tokenId}&backgroundColor=e5e7eb`;
                              await addErc721ToWallet(contractAddresses.fantasyTeamNft, 'SQUAD', tokenId, imgUrl);
                              setAddedSquads((prev) => new Set(prev).add(tokenId));
                              setTimeout(() => {
                                setAddedSquads((prev) => {
                                  const next = new Set(prev);
                                  next.delete(tokenId);
                                  return next;
                                });
                              }, 5000);
                            } catch (e) {
                              // Optional: handle err
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold transition-all ${
                            isAdded
                              ? 'bg-[#10B981] border-[#10B981] text-white shadow-md'
                              : 'bg-white border-[#10B981]/30 text-[#059669] hover:bg-[#10B981]/10 shadow-sm'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded overflow-hidden shadow-sm border bg-[#10B981]/5 flex items-center justify-center p-0.5 ${isAdded ? 'border-white/30' : 'border-[#10B981]/20'}`}>
                            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=squad-${tokenId}&backgroundColor=e5e7eb`} alt="Squad" className="w-full h-full object-contain" />
                          </div>
                          {isAdded ? `✓ Squad #${tokenId} Added` : `+ Add Squad #${tokenId}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-bold text-[#0F1117]">Rankings</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTop10Only(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                showTop10Only
                  ? 'bg-[#10B981] text-white shadow-elevated'
                  : 'bg-[#FAFAFA] text-[#5B6B7A] hover:bg-white border border-[#E5E7EB]'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setShowTop10Only(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                !showTop10Only
                  ? 'bg-[#10B981] text-white shadow-elevated'
                  : 'bg-[#FAFAFA] text-[#5B6B7A] hover:bg-white border border-[#E5E7EB]'
              }`}
            >
              All Players
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FAFAFA] to-white border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Rank</th>
                <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Player</th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-[#0F1117]">Squad</th>
                <th className="px-4 md:px-6 py-4 text-right text-sm font-semibold text-[#0F1117]">Points</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-center text-sm font-semibold text-[#0F1117]">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {displayedLeaderboard.map((entry, idx) => {
                const isAnimating = animatingRanks.has(entry.userId);
                const isCurrentUser = entry.isCurrentUser;
                const pointsPercent = (entry.totalPoints / maxPoints) * 100;

                const getMedalIcon = (rank: number) => {
                  if (rank === 0) return '🥇';
                  if (rank === 1) return '🥈';
                  if (rank === 2) return '🥉';
                  return null;
                };

                return (
                  <tr
                    key={entry.userId}
                    className={`transition-smooth ${
                      isCurrentUser ? 'bg-gradient-to-r from-[#10B981]/5 to-transparent' : idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]/50'
                    } ${isAnimating ? 'animate-pulse' : ''} hover:bg-[#FAFAFA] group`}
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${idx * 50}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getMedalIcon(idx) && <span className="text-lg">{getMedalIcon(idx)}</span>}
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                            idx === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : idx === 1
                                ? 'bg-gray-100 text-gray-700'
                                : idx === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-[#E5E7EB] text-[#5B6B7A]'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className={`font-semibold ${isCurrentUser ? 'text-[#10B981]' : 'text-[#0F1117]'}`}>
                          {entry.userName}
                        </p>
                        {isCurrentUser && (
                          <span className="text-xs bg-[#10B981]/10 text-[#059669] px-2 py-0.5 rounded inline-block mt-1 font-medium">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <p className="text-[#5B6B7A] text-sm font-medium">{entry.squadName}</p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="hidden sm:block w-16 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full transition-all duration-300"
                            style={{ width: `${pointsPercent}%` }}
                          ></div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#0F1117] tabular-nums text-sm md:text-base">
                            {entry.totalPoints.toLocaleString()}
                          </p>
                          {isAnimating && (
                            <span className="text-xs text-[#10B981] font-bold">+{Math.floor(Math.random() * 6) + 1}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-4 md:px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {entry.change > 0 ? (
                          <div className="flex items-center gap-1 bg-green-50 px-2 md:px-3 py-1.5 rounded-lg group-hover:shadow-elevated transition-smooth">
                            <ArrowUp className="w-4 h-4 text-[#10B981]" />
                            <span className="text-sm font-semibold text-[#10B981]">+{entry.change}</span>
                          </div>
                        ) : entry.change < 0 ? (
                          <div className="flex items-center gap-1 bg-red-50 px-2 md:px-3 py-1.5 rounded-lg group-hover:shadow-elevated transition-smooth">
                            <ArrowDown className="w-4 h-4 text-[#EF4444]" />
                            <span className="text-sm font-semibold text-[#EF4444]">{entry.change}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 bg-gray-50 px-2 md:px-3 py-1.5 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-[#4B5563]" />
                            <span className="text-sm font-semibold text-[#4B5563]">—</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Indicator */}
        {showTop10Only && sortedLeaderboard.length > 10 && (
          <div className="mt-6 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <button
              onClick={() => setShowTop10Only(false)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#10B981]/10 to-transparent border border-[#10B981]/30 text-[#0F1117] font-medium hover:border-[#10B981]/60 transition-smooth"
            >
              View All {sortedLeaderboard.length} Players
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
