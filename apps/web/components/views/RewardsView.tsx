"use client";

import { useState } from 'react';
import { Award, CheckCircle2, Clock3, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import { contestManagerAbi } from '@wirefluid/contracts';
import { contractAddresses } from '@/contracts/addresses';
import { useCurrentUserPassport } from '@/api/useIndexerData';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { formatWire } from '@/utils/arenaFormat';
import { getClaimActionState } from '@/utils/actionStates';
import { getPassportLevel } from '@/utils/passportLevel';
import { addErc721ToWallet } from '@/utils/watchAsset';

interface RewardsViewProps {
  wireBalance: number;
  onClaimRewards: (amount: number) => void;
}

export function RewardsView({ wireBalance, onClaimRewards }: RewardsViewProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [hasAddedToWallet, setHasAddedToWallet] = useState(false);
  const passport = useCurrentUserPassport();
  const writer = useArenaWriter();

  const claimableReward = passport.data?.balance?.claimableReward ?? '0';
  const refundableAmount = passport.data?.balance?.refundableAmount ?? '0';
  const profile = passport.data?.passport ?? null;
  const rewardClaimState = getClaimActionState(claimableReward, writer.isBusy, 'No rewards are available to claim yet.');
  const refundClaimState = getClaimActionState(refundableAmount, writer.isBusy, 'No refunds are available to claim.');

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

  const level = getPassportLevel(profile);

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
                <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm relative overflow-hidden">
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#10B981]/10 shadow-sm border border-[#10B981]/20 flex items-center justify-center">
                    <img 
                      src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=passport-${profile?.tokenId ?? '0'}&backgroundColor=e5e7eb`} 
                      alt="Passport Artwork"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" /> Digital Identity Protocol
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-sm">
                      This token serves as your on-chain fantasy arena reputation. It intrinsically binds your XP, completed brackets, and total rewards distributed across the decentralized indexer perfectly into MetaMask.
                    </p>
                    
                    {profile && (
                      <button
                        disabled={hasAddedToWallet}
                        onClick={async () => {
                          try {
                            const metaRes = await fetch(`/api/nft/passport/${profile.tokenId}`);
                            const metaJson = await metaRes.json();
                            let imgUrl = metaJson.image || '';
                            // Force MetaMask strictly onto the HTTPS gateway instead of raw IPFS protocol string
                            if (imgUrl.startsWith('ipfs://')) {
                              imgUrl = imgUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
                            }
                            await addErc721ToWallet(contractAddresses.legacyPassport, 'PASSPORT', profile.tokenId, imgUrl);
                            setHasAddedToWallet(true);
                            setTimeout(() => setHasAddedToWallet(false), 5000);
                          } catch (e) {
                            const err = e as Error;
                            setStatusMessage(`Failed to import to wallet: ${err.message || String(err)}`);
                          }
                        }}
                        className={`mt-4 inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                          hasAddedToWallet 
                            ? 'bg-emerald-100 text-emerald-700 pointer-events-none' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {hasAddedToWallet ? '✓ Added to MetaMask' : '+ Import to MetaMask'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Level" value={level.name} />
              <StatCard label="XP" value={level.xp.toString()} />
              <StatCard label="Contests Entered" value={profile ? profile.contestsEntered.toString() : '0'} />
              <StatCard label="Winning Entries" value={profile ? profile.contestsWon.toString() : '0'} />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>{level.nextMin ? `Next level at ${level.nextMin} XP` : 'Max level'}</span>
                <span>{level.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${level.progress}%` }} />
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Rewards Claimed</h3>
            <p className="mt-3 text-2xl font-bold text-slate-900">{profile ? formatWire(profile.totalRewardsClaimed) : '0 WIRE'}</p>
            <p className="mt-2 text-sm text-slate-600">Your passport level grows from contest entries and wins.</p>
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
              disabled={rewardClaimState.disabled}
              title={rewardClaimState.reason}
              className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Claim Reward
            </button>
            {rewardClaimState.reason ? <p className="mt-2 text-xs text-slate-500">{rewardClaimState.reason}</p> : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <Clock3 className="w-4 h-4" />
              Refundable Balance
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{formatWire(refundableAmount)}</p>
            <button
              onClick={handleClaimRefund}
              disabled={refundClaimState.disabled}
              title={refundClaimState.reason}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            >
              Claim Refund
            </button>
            {refundClaimState.reason ? <p className="mt-2 text-xs text-slate-500">{refundClaimState.reason}</p> : null}
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
