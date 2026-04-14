'use client';

import { useState } from 'react';
import { Activity, AlertCircle, Clock, Database, Settings, Trophy, Wallet } from 'lucide-react';
import {
  contestManagerAbi,
  fantasyTeamNftAbi,
  legacyPassportAbi,
  matchRegistryAbi
} from '@wirefluid/contracts';
import { useAccount } from 'wagmi';
import { getAddress, isAddress } from 'viem';
import { contractAddresses, contractsConfigured } from '@/contracts/addresses';
import { useAuditEvents, useCurrentUserPassport, useIndexedContests, useIndexedMatches, useIndexerSummary } from '@/api/useIndexerData';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { useRoleChecks } from '@/web3/useRoleChecks';
import {
  encodeTeamBytes32,
  formatDateTime,
  formatWire,
  parseWireInput,
  statusLabel,
  teamCodeFromBytes,
  toUnixSeconds
} from '@/utils/arenaFormat';

const ROLE_TO_ID: Record<string, number> = { WK: 0, BAT: 1, AR: 2, BOWL: 3 };
const SIDE_TO_ID: Record<string, number> = { HOME: 1, AWAY: 2 };

export function ProtocolView() {
  const roles = useRoleChecks();
  const writer = useArenaWriter();
  const [squadBaseUri, setSquadBaseUri] = useState('');
  const [passportBaseUri, setPassportBaseUri] = useState('');

  const contracts = [
    ['MatchRegistry', contractAddresses.matchRegistry],
    ['FantasyTeamNFT', contractAddresses.fantasyTeamNft],
    ['LegacyPassport', contractAddresses.legacyPassport],
    ['ScoreManager', contractAddresses.scoreManager],
    ['ContestManager', contractAddresses.contestManager],
  ] as const;

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contracts & Roles</h1>
        <p className="text-slate-600">Deployment addresses, role health, and metadata controls</p>
      </div>

      {!contractsConfigured && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Contract addresses are not configured for the selected chain. For local development use chain 31337 and let the app read `packages/contracts/deployments/31337.json`; only use env address values as overrides.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {contracts.map(([name, address]) => (
          <div key={name} className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-600">{name}</p>
            <p className="mt-2 break-all font-mono text-sm text-slate-900">{address}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-900 mb-4">Connected Wallet Roles</h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              ['Admin', roles.admin],
              ['Operator', roles.operator],
              ['Score Publisher', roles.scorePublisher],
              ['Treasury', roles.treasury],
            ] as const).map(([label, enabled]) => (
              <div
                key={label}
                className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                  !roles.ready
                    ? 'bg-blue-50 text-blue-700'
                    : enabled
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {label}: {!roles.ready ? 'Checking' : enabled ? 'Granted' : 'Missing'}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-900 mb-4">NFT Metadata</h2>
          <div className="space-y-3">
            <input value={squadBaseUri} onChange={(event) => setSquadBaseUri(event.target.value)} placeholder="FantasyTeamNFT base URI" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <button
              onClick={() => writer.write({ address: contractAddresses.fantasyTeamNft, abi: fantasyTeamNftAbi, functionName: 'setBaseURI', args: [squadBaseUri] })}
              disabled={!squadBaseUri || writer.isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Set Squad Base URI
            </button>
            <input value={passportBaseUri} onChange={(event) => setPassportBaseUri(event.target.value)} placeholder="LegacyPassport base URI" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <button
              onClick={() => writer.write({ address: contractAddresses.legacyPassport, abi: legacyPassportAbi, functionName: 'setBaseURI', args: [passportBaseUri] })}
              disabled={!passportBaseUri || writer.isSubmitting}
              className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Set Passport Base URI
            </button>
            {writer.hash && <p className="break-all text-xs text-slate-500">Tx: {writer.hash}</p>}
            {writer.error && <p className="text-xs text-red-600">{writer.error}</p>}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900 mb-3">Local Admin Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
          {[
            'Start Anvil with chain ID 31337.',
            'Deploy contracts and seed demo data from the contracts workspace.',
            'Connect wallet 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266.',
            'Switch the wallet network to chain 31337.',
            'The Admin button appears when on-chain roles are detected.',
            'Click Admin and verify the wallet signature.',
            'Use Match to create matches, set player pools, and create contests.',
            'Use Score and Treasury to submit stats, finalize contests, and manage payouts.'
          ].map((step, index) => (
            <div key={step} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-900">{index + 1}.</span> {step}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function MatchView() {
  const matches = useIndexedMatches();
  const contests = useIndexedContests();
  const writer = useArenaWriter();
  const matchOptions = matches.data ?? [];
  const contestOptions = contests.data ?? [];
  const [matchId, setMatchId] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [lockTime, setLockTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [playerPoolMatchId, setPlayerPoolMatchId] = useState('');
  const [playerCsv, setPlayerCsv] = useState('1,WK,HOME\n2,BAT,HOME\n3,BAT,HOME\n4,BAT,HOME\n5,AR,HOME\n6,BOWL,HOME\n7,BOWL,AWAY\n8,BOWL,AWAY\n9,BAT,AWAY\n10,AR,AWAY\n11,WK,AWAY');
  const [contestId, setContestId] = useState('');
  const [contestMatchId, setContestMatchId] = useState('');
  const [entryFee, setEntryFee] = useState('0.01');

  const matchSelectValue = matchOptions.some((match) => match.matchId === matchId) ? matchId : '';
  const playerPoolSelectValue = matchOptions.some((match) => match.matchId === playerPoolMatchId)
    ? playerPoolMatchId
    : '';
  const contestMatchSelectValue = matchOptions.some((match) => match.matchId === contestMatchId)
    ? contestMatchId
    : '';

  const nextMatchId = computeNextId(matchOptions.map((match) => match.matchId));
  const nextContestId = computeNextId(contestOptions.map((contest) => contest.contestId));

  const lockTimestamp = lockTime ? Date.parse(lockTime) : NaN;
  const startTimestamp = startTime ? Date.parse(startTime) : NaN;
  const matchTimingError = !lockTime || !startTime
    ? ''
    : !Number.isFinite(lockTimestamp) || !Number.isFinite(startTimestamp)
      ? 'Lock and start time must be valid dates.'
      : lockTimestamp <= Date.now()
        ? 'Lock time must be in the future.'
        : startTimestamp <= lockTimestamp
          ? 'Start time must be after lock time.'
          : '';
  const canCreateMatch = Boolean(matchId && homeTeam && awayTeam && lockTime && startTime && !matchTimingError);

  const createMatch = async () => {
    await writer.write({
      address: contractAddresses.matchRegistry,
      abi: matchRegistryAbi,
      functionName: 'createMatch',
      args: [BigInt(matchId), encodeTeamBytes32(homeTeam), encodeTeamBytes32(awayTeam), toUnixSeconds(startTime), toUnixSeconds(lockTime)]
    });
  };

  const setPlayers = async () => {
    const rows = parsePlayerCsv(playerCsv);
    await writer.write({
      address: contractAddresses.matchRegistry,
      abi: matchRegistryAbi,
      functionName: 'setMatchPlayers',
      args: [BigInt(playerPoolMatchId), rows.playerIds, rows.roles, rows.teamSides]
    });
  };

  const createContest = async () => {
    await writer.write({
      address: contractAddresses.contestManager,
      abi: contestManagerAbi,
      functionName: 'createContest',
      args: [BigInt(contestId), BigInt(contestMatchId), parseWireInput(entryFee), 25, 3]
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Match & Contest Operations</h1>
        <p className="text-slate-600">Create matches, set player pools, and open one contest per match</p>
      </div>

      {!contractsConfigured && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Contract addresses are not configured for the selected chain. Fix the chain ID or deployment first.
        </div>
      )}

      {writer.rpcChainId && writer.configuredChainId && writer.rpcChainId !== writer.configuredChainId && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          RPC chain ID {writer.rpcChainId} does not match the configured chain ID {writer.configuredChainId}. Update your env or restart Anvil with the correct chain ID.
        </div>
      )}

      {writer.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{writer.error}</span>
        </div>
      )}

      {writer.isConfirming && writer.hash && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <section className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-600" />Create Match</h2>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">Match</label>
            <select
              value={matchSelectValue}
              onChange={(event) => setMatchId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Custom match ID</option>
              {matchOptions.map((option) => (
                <option key={option.matchId} value={option.matchId}>
                  #{option.matchId} · {statusLabel(option.status)} · lock {formatDateTime(option.lockTime)}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                value={matchId}
                onChange={(event) => setMatchId(event.target.value)}
                placeholder={nextMatchId ? `Next ID ${nextMatchId}` : "Match ID"}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => nextMatchId && setMatchId(nextMatchId)}
                disabled={!nextMatchId}
                className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Use next
              </button>
            </div>
            <input value={homeTeam} onChange={(event) => setHomeTeam(event.target.value)} placeholder="Home team" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={awayTeam} onChange={(event) => setAwayTeam(event.target.value)} placeholder="Away team" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-600">Lock time</label>
            <input type="datetime-local" value={lockTime} onChange={(event) => setLockTime(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-600">Start time</label>
            <input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            {matchTimingError && <p className="text-xs text-red-600">{matchTimingError}</p>}
            <button
              onClick={() => {
                void createMatch().catch(() => {});
              }}
              disabled={writer.isSubmitting || !canCreateMatch}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create Match
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-emerald-600" />Set Player Pool</h2>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">Match</label>
            <select
              value={playerPoolSelectValue}
              onChange={(event) => setPlayerPoolMatchId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Custom match ID</option>
              {matchOptions.map((option) => (
                <option key={option.matchId} value={option.matchId}>
                  #{option.matchId} · {statusLabel(option.status)} · lock {formatDateTime(option.lockTime)}
                </option>
              ))}
            </select>
            <input
              value={playerPoolMatchId}
              onChange={(event) => setPlayerPoolMatchId(event.target.value)}
              placeholder="Match ID"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea value={playerCsv} onChange={(event) => setPlayerCsv(event.target.value)} rows={10} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs" />
            <p className="text-xs text-slate-500">CSV format: `playerId,role,side`; roles WK/BAT/AR/BOWL; sides HOME/AWAY.</p>
            <p className="text-xs text-slate-500">On-chain storage includes only `playerId`, role, and team side. Player display names are off-chain UI metadata.</p>
            <button
              onClick={() => {
                void setPlayers().catch(() => {});
              }}
              disabled={writer.isSubmitting || !playerPoolMatchId}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Set Players
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-600" />Create Contest</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={contestId}
                onChange={(event) => setContestId(event.target.value)}
                placeholder={nextContestId ? `Next ID ${nextContestId}` : "Contest ID"}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => nextContestId && setContestId(nextContestId)}
                disabled={!nextContestId}
                className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
              >
                Use next
              </button>
            </div>
            <label className="block text-xs font-semibold text-slate-600">Match</label>
            <select
              value={contestMatchSelectValue}
              onChange={(event) => setContestMatchId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Custom match ID</option>
              {matchOptions.map((option) => (
                <option key={option.matchId} value={option.matchId}>
                  #{option.matchId} · {statusLabel(option.status)} · lock {formatDateTime(option.lockTime)}
                </option>
              ))}
            </select>
            <input
              value={contestMatchId}
              onChange={(event) => setContestMatchId(event.target.value)}
              placeholder="Match ID"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input value={entryFee} onChange={(event) => setEntryFee(event.target.value)} placeholder="Entry fee in WIRE" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <button
              onClick={() => {
                void createContest().catch(() => {});
              }}
              disabled={writer.isSubmitting || !contestId || !contestMatchId || !entryFee}
              className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create Contest
            </button>
            {writer.hash && <p className="break-all text-xs text-slate-500">Tx: {writer.hash}</p>}
            {writer.error && <p className="text-xs text-red-600">{writer.error}</p>}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200"><h2 className="font-bold text-slate-900">Indexed Matches</h2></div>
          <div className="divide-y divide-slate-200">
            {(matches.data ?? []).map((match) => (
              <div key={match.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{teamCodeFromBytes(match.homeTeam, 'HOME')} vs {teamCodeFromBytes(match.awayTeam, 'AWAY')}</p>
                  <p className="text-sm text-slate-600">#{match.matchId} · {statusLabel(match.status)} · lock {formatDateTime(match.lockTime)}</p>
                </div>
                <span className="text-sm text-slate-500">{match.playerCount} players</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200"><h2 className="font-bold text-slate-900">Indexed Contests</h2></div>
          <div className="divide-y divide-slate-200">
            {(contests.data ?? []).map((contest) => (
              <div key={contest.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">Contest #{contest.contestId}</p>
                  <p className="text-sm text-slate-600">Match #{contest.matchId} · {contest.totalEntries}/{contest.maxEntries} entries</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{formatWire(contest.entryFee)}</span>
                  <button
                    onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'finalizeContest', args: [BigInt(contest.contestId)] })}
                    disabled={writer.isSubmitting || contest.finalized || contest.cancelled}
                    className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Finalize
                  </button>
                  <button
                    onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'cancelContest', args: [BigInt(contest.contestId)] })}
                    disabled={writer.isSubmitting || contest.finalized || contest.cancelled}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function TreasuryView() {
  const { address } = useAccount();
  const summary = useIndexerSummary();
  const passport = useCurrentUserPassport();
  const audit = useAuditEvents();
  const writer = useArenaWriter();
  const [newTreasury, setNewTreasury] = useState('');
  const treasury = summary.data?.treasury ?? null;
  const balance = passport.data?.balance ?? null;
  const passportStats = passport.data?.passport ?? null;

  const setTreasury = async () => {
    if (!isAddress(newTreasury)) throw new Error('Invalid treasury address');
    await writer.write({
      address: contractAddresses.contestManager,
      abi: contestManagerAbi,
      functionName: 'setTreasury',
      args: [getAddress(newTreasury)]
    });
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Treasury, Passport & Audit</h1>
        <p className="text-slate-600">Pull claims, treasury controls, passport lookup, and protocol event history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-slate-200 p-6">
          <Wallet className="w-5 h-5 text-teal-600 mb-3" />
          <p className="text-sm text-slate-600">Treasury claimable</p>
          <p className="text-2xl font-bold text-slate-900">{formatWire(treasury?.claimable ?? '0')}</p>
          <button onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'claimTreasury' })} disabled={writer.isSubmitting} className="mt-4 w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Claim Treasury</button>
        </div>
        <div className="rounded-lg border border-slate-200 p-6">
          <Trophy className="w-5 h-5 text-amber-600 mb-3" />
          <p className="text-sm text-slate-600">Claimable rewards</p>
          <p className="text-2xl font-bold text-slate-900">{formatWire(balance?.claimableReward ?? '0')}</p>
          <button onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'claimReward' })} disabled={writer.isSubmitting || !address} className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Claim Reward</button>
        </div>
        <div className="rounded-lg border border-slate-200 p-6">
          <AlertCircle className="w-5 h-5 text-blue-600 mb-3" />
          <p className="text-sm text-slate-600">Refundable entries</p>
          <p className="text-2xl font-bold text-slate-900">{formatWire(balance?.refundableAmount ?? '0')}</p>
          <button onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'claimRefund' })} disabled={writer.isSubmitting || !address} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Claim Refund</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <section className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-600" />Treasury Address</h2>
          <p className="mb-3 break-all text-sm text-slate-600">Current: {treasury?.treasury ?? 'Not indexed yet'}</p>
          <input value={newTreasury} onChange={(event) => setNewTreasury(event.target.value)} placeholder="New treasury address" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={setTreasury} disabled={writer.isSubmitting || !newTreasury} className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Set Treasury</button>
          {writer.hash && <p className="mt-3 break-all text-xs text-slate-500">Tx: {writer.hash}</p>}
          {writer.error && <p className="mt-3 text-xs text-red-600">{writer.error}</p>}
        </section>

        <section className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Connected Passport</h2>
          {passportStats ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Token ID" value={`#${passportStats.tokenId}`} />
              <Metric label="Contests entered" value={passportStats.contestsEntered.toString()} />
              <Metric label="Wins" value={passportStats.contestsWon.toString()} />
              <Metric label="Rewards claimed" value={formatWire(passportStats.totalRewardsClaimed)} />
            </div>
          ) : (
            <p className="text-sm text-slate-600">No passport indexed for the connected wallet yet.</p>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Audit Events</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {(audit.data ?? []).slice(0, 20).map((event) => (
            <div key={event.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{event.contractName}.{event.eventName}</p>
                <span className="text-xs text-slate-500">Block {event.blockNumber}</span>
              </div>
              <p className="mt-1 break-all text-xs text-slate-500">{event.transactionHash}</p>
            </div>
          ))}
          {(audit.data ?? []).length === 0 && <p className="p-6 text-center text-slate-500">No indexed events yet.</p>}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="font-bold text-slate-900">{value}</p>
    </div>
  );
}

function computeNextId(values: Array<string | number | bigint | null | undefined>): string {
  const numeric = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (numeric.length === 0) return '';
  return String(Math.max(...numeric) + 1);
}

function parsePlayerCsv(value: string) {
  const rows = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((part) => part.trim().toUpperCase()));

  const playerIds: number[] = [];
  const roles: number[] = [];
  const teamSides: number[] = [];

  for (const [id, role, side] of rows) {
    const playerId = Number(id);
    const roleId = role ? ROLE_TO_ID[role] : undefined;
    const sideId = side ? SIDE_TO_ID[side] : undefined;
    if (!Number.isInteger(playerId) || playerId <= 0 || roleId === undefined || sideId === undefined) {
      throw new Error(`Invalid player row: ${id},${role},${side}`);
    }
    playerIds.push(playerId);
    roles.push(roleId);
    teamSides.push(sideId);
  }

  return { playerIds, roles, teamSides };
}
