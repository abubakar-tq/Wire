'use client';

import { useState } from 'react';
import { Gift, Loader, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { contestManagerAbi } from '@wirefluid/contracts';
import { contractAddresses } from '@/contracts/addresses';
import { useCurrentUserPassport } from '@/api/useIndexerData';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { formatWire } from '@/utils/arenaFormat';

interface RewardsViewProps {
  wireBalance: number;
  onClaimRewards: (amount: number) => void;
}

type ClaimState = 'IDLE' | 'LOADING' | 'AWAITING_SIGNATURE' | 'BROADCASTING' | 'CONFIRMED' | 'SUCCESS';

export function RewardsView({ wireBalance, onClaimRewards }: RewardsViewProps) {
  const [claimState, setClaimState] = useState<ClaimState>('IDLE');
  const [displayBalance, setDisplayBalance] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const passport = useCurrentUserPassport();
  const writer = useArenaWriter();
  const claimableReward = passport.data?.balance?.claimableReward ?? '0';
  const refundableAmount = passport.data?.balance?.refundableAmount ?? '0';

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
    setClaimState('AWAITING_SIGNATURE');
    await writer.write({
      address: contractAddresses.contestManager,
      abi: contestManagerAbi,
      functionName: 'claimReward'
    });
    setClaimState('CONFIRMED');
    setClaimState('SUCCESS');
    setConfetti(true);
    onClaimRewards(Number(claimableReward));

    setTimeout(() => {
      setConfetti(false);
      setTimeout(() => {
        setClaimState('IDLE');
        setDisplayBalance(0);
      }, 1000);
    }, 2000);
  };

  const handleClaimRefund = async () => {
    setClaimState('AWAITING_SIGNATURE');
    await writer.write({
      address: contractAddresses.contestManager,
      abi: contestManagerAbi,
      functionName: 'claimRefund'
    });
    setClaimState('SUCCESS');
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
              <span className="text-6xl font-black text-[#0F1117] tabular-nums">{formatWire(claimableReward)}</span>
            </div>
            <p className="text-sm text-[#4B5563] mb-8 max-w-md mx-auto">Rewards and refunds are pull-based on-chain balances.</p>
            <button
              onClick={handleClaimRewards}
              disabled={BigInt(claimableReward) === 0n || writer.isSubmitting}
              className="mx-auto px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Claim Rewards
            </button>
            <button
              onClick={handleClaimRefund}
              disabled={BigInt(refundableAmount) === 0n || writer.isSubmitting}
              className="ml-3 px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg transition-all disabled:opacity-50"
            >
              Claim Refunds ({formatWire(refundableAmount)})
            </button>
            {writer.error && <p className="mt-4 text-sm text-red-600">{writer.error}</p>}
          </div>

          {/* Recent Rewards */}
          <div>
            <h2 className="text-lg font-bold text-[#0F1117] mb-4">Passport Stats</h2>
            <div className="space-y-3">
              {[
                { label: 'Contests entered', amount: passport.data?.passport?.contestsEntered ?? 0 },
                { label: 'Winning entries', amount: passport.data?.passport?.contestsWon ?? 0 },
                { label: 'Total rewards claimed', amount: formatWire(passport.data?.passport?.totalRewardsClaimed ?? '0') },
              ].map((reward, idx) => (
                <div key={idx} className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all">
                  <span className="text-[#0F1117] font-medium">{reward.label}</span>
                  <span className="font-bold text-[#F5A623] tabular-nums">{reward.amount}</span>
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
