'use client';

import { useState } from 'react';
import { Gift, Loader, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface RewardsViewProps {
  wireBalance: number;
  onClaimRewards: (amount: number) => void;
}

type ClaimState = 'IDLE' | 'LOADING' | 'AWAITING_SIGNATURE' | 'BROADCASTING' | 'CONFIRMED' | 'SUCCESS';

export function RewardsView({ wireBalance, onClaimRewards }: RewardsViewProps) {
  const [claimState, setClaimState] = useState<ClaimState>('IDLE');
  const [displayBalance, setDisplayBalance] = useState(0);
  const [confetti, setConfetti] = useState(false);

  // Animate balance count-up
  useEffect(() => {
    if (claimState === 'SUCCESS') {
      let current = displayBalance;
      const target = wireBalance;
      const increment = Math.ceil((target - current) / 20);

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setDisplayBalance(current);
      }, 30);

      return () => clearInterval(timer);
    }
  }, [claimState, wireBalance, displayBalance]);

  const handleClaimRewards = async () => {
    setClaimState('LOADING');

    await new Promise((r) => setTimeout(r, 400));
    setClaimState('AWAITING_SIGNATURE');

    await new Promise((r) => setTimeout(r, 1200));
    setClaimState('BROADCASTING');

    await new Promise((r) => setTimeout(r, 1000));
    setClaimState('CONFIRMED');

    await new Promise((r) => setTimeout(r, 600));
    setClaimState('SUCCESS');
    setConfetti(true);
    onClaimRewards(2400);

    setTimeout(() => {
      setConfetti(false);
      setTimeout(() => {
        setClaimState('IDLE');
        setDisplayBalance(0);
      }, 1000);
    }, 2000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto h-[calc(100vh-73px)]">
      {/* Confetti Overlay */}
      {confetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="fixed w-2 h-2 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#10B981', '#F5A623', '#8B5CF6', '#2563EB'][Math.floor(Math.random() * 4)],
                animation: `float ${2 + Math.random() * 1}s ease-out forwards`,
              }}
            />
          ))}
        </div>
      )}

      {claimState === 'IDLE' ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F1117] mb-2">Rewards Dashboard</h1>
            <p className="text-[#4B5563]">Claim your fantasy sports winnings and rewards</p>
          </div>

          {/* Main Reward Card */}
          <div className="bg-gradient-to-br from-[#F5A623]/20 to-[#10B981]/20 rounded-xl border border-[#F5A623]/30 p-12 mb-8 text-center">
            <Gift className="w-16 h-16 text-[#F5A623] mx-auto mb-6" />
            <p className="text-[#4B5563] text-lg mb-4">Your Pending Rewards</p>
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-[#F5A623] text-3xl">◈</span>
              <span className="text-6xl font-black text-[#0F1117] tabular-nums">2,400</span>
            </div>
            <p className="text-sm text-[#4B5563] mb-8 max-w-md mx-auto">
              You&apos;ve earned premium rewards from your recent squad performances and leaderboard rankings
            </p>
            <button
              onClick={handleClaimRewards}
              className="mx-auto px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Claim Rewards
            </button>
          </div>

          {/* Recent Rewards */}
          <div>
            <h2 className="text-lg font-bold text-[#0F1117] mb-4">Recent Winnings</h2>
            <div className="space-y-3">
              {[
                { label: 'Weekly Leaderboard Top 3', amount: 800 },
                { label: 'Squad NFT Bonus', amount: 600 },
                { label: 'Performance Multiplier', amount: 400 },
                { label: 'Referral Rewards', amount: 600 },
              ].map((reward, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all">
                  <span className="text-[#0F1117] font-medium">{reward.label}</span>
                  <span className="font-bold text-[#F5A623] tabular-nums">◈ {reward.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : claimState === 'LOADING' ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader className="w-12 h-12 text-[#10B981] animate-spin mx-auto mb-4" />
            <p className="text-[#0F1117] font-bold">Processing Claim...</p>
            <p className="text-[#4B5563] text-sm mt-2">Please wait</p>
          </div>
        </div>
      ) : claimState === 'SUCCESS' ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center bg-white rounded-xl border border-[#E5E7EB] p-12 max-w-md">
            <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#0F1117] mb-2">Rewards Claimed!</h2>
            <div className="flex items-baseline justify-center gap-2 my-8">
              <span className="text-[#F5A623] text-2xl">◈</span>
              <span className="text-4xl font-black text-[#0F1117] tabular-nums">{displayBalance.toLocaleString()}</span>
            </div>
            <p className="text-[#4B5563] text-sm">Successfully added to your wallet</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center bg-white rounded-xl border border-[#E5E7EB] p-12 max-w-md">
            <Loader className="w-12 h-12 text-[#2563EB] animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-[#0F1117] mb-4">
              {claimState === 'AWAITING_SIGNATURE' && 'Awaiting Signature'}
              {claimState === 'BROADCASTING' && 'Broadcasting Transaction'}
              {claimState === 'CONFIRMED' && 'Transaction Confirmed'}
            </h2>
            <p className="text-[#4B5563] text-sm">
              {claimState === 'AWAITING_SIGNATURE' && 'Please confirm in your wallet'}
              {claimState === 'BROADCASTING' && 'Processing on blockchain...'}
              {claimState === 'CONFIRMED' && 'Finalizing...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
