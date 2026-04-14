"use client";

import { useState } from 'react';
import { Award, CheckCircle2, Clock3, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import { contestManagerAbi } from '@wirefluid/contracts';
import { contractAddresses } from '@/contracts/addresses';
import { useCurrentUserPassport } from '@/api/useIndexerData';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { formatWire } from '@/utils/arenaFormat';
import { useSiweSession } from '@/auth/useSiweSession';

interface RewardsViewProps {
  wireBalance: number;
  onClaimRewards: (amount: number) => void;
}

export function RewardsView({ wireBalance, onClaimRewards }: RewardsViewProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const passport = useCurrentUserPassport();
  const auth = useSiweSession();
  const writer = useArenaWriter();

  const claimableReward = passport.data?.balance?.claimableReward ?? '0';
  const refundableAmount = passport.data?.balance?.refundableAmount ?? '0';
  const profile = passport.data?.passport ?? null;

  const handleClaimRewards = async () => {
    await writer.write({
      address: contractAddresses.contestManager,
      abi: contestManagerAbi,
      functionName: 'claimReward'
    });
    onClaimRewards(Number(claimableReward));
    setStatusMessage('Reward claim submitted. Refresh in a few seconds to see updated indexed balances.');
  };

  const handleClaimRefund = async () => {
    await writer.write({
      address: contractAddresses.contestManager,
      abi: contestManagerAbi,
      functionName: 'claimRefund'
    });
    setStatusMessage('Refund claim submitted.');
  };

  const growthScore = profile
    ? Math.min(100, Number(profile.contestsEntered) * 4 + Number(profile.contestsWon) * 8)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Legacy Passport</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold text-slate-900">Player Profile & Rewards</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your passport follows your wallet across every match. Stats and claim history accumulate over time.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  <UserRound className="w-3.5 h-3.5" />
                  Wallet Passport
                </div>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {profile ? `Passport #${profile.tokenId}` : 'No Passport Minted Yet'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {profile ? 'This identity persists with your wallet and keeps growing each contest.' : 'Join your first contest to mint and start building this profile.'}
                </p>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Contests Entered" value={profile ? profile.contestsEntered.toString() : '0'} />
              <StatCard label="Winning Entries" value={profile ? profile.contestsWon.toString() : '0'} />
              <StatCard label="Rewards Claimed" value={profile ? formatWire(profile.totalRewardsClaimed) : '0 WIRE'} />
              <StatCard label="Profile Growth" value={`${growthScore}%`} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progression Across Matches</span>
                <span>{growthScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${growthScore}%` }} />
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Authorization</h3>
            <p className="mt-2 font-semibold text-slate-900">{auth.authenticated ? 'SIWE Session Active' : 'Wallet-Only Mode'}</p>
            <p className="mt-1 text-xs text-slate-500 break-all">{auth.session?.address ?? 'Sign in to access admin APIs'}</p>
            <button
              onClick={async () => {
                if (auth.authenticated) {
                  await auth.signOut();
                } else {
                  await auth.signIn();
                }
              }}
              className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              {auth.authenticated ? 'Sign Out' : 'Sign In'}
            </button>
          </aside>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <Wallet className="w-4 h-4" />
              Claimable Reward
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{formatWire(claimableReward)}</p>
            <button
              onClick={handleClaimRewards}
              disabled={BigInt(claimableReward) === 0n || writer.isSubmitting}
              className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Claim Reward
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <Clock3 className="w-4 h-4" />
              Refundable Balance
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{formatWire(refundableAmount)}</p>
            <button
              onClick={handleClaimRefund}
              disabled={BigInt(refundableAmount) === 0n || writer.isSubmitting}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            >
              Claim Refund
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4" />
              Balance Context
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Claim states are indexed and then settled by on-chain contract calls. Keep Anvil and indexer running for accurate local values.
            </p>
            <p className="mt-3 text-xs text-slate-500">UI wallet balance: {wireBalance.toLocaleString()} WIRE</p>
          </div>
        </section>

        {(statusMessage || writer.error) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600" />
            <p>{writer.error ?? statusMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
