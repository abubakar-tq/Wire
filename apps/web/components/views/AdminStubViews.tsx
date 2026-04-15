'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, AlertCircle, ChevronDown, ChevronUp, Clock, Database, Plus, Settings, Trophy, Wallet } from 'lucide-react';
import {
  contestManagerAbi,
  fantasyTeamNftAbi,
  legacyPassportAbi,
  matchRegistryAbi
} from '@wirefluid/contracts';
import { getAddress, isAddress } from 'viem';
import { contractAddresses, contractsConfigured } from '@/contracts/addresses';
import {
  useAuditEvents,
  useIndexedContests,
  useIndexedMatches,
  useIndexerHealth,
  useIndexerSummary
} from '@/api/useIndexerData';
import { usePlayerProfiles } from '@/api/usePlayerProfiles';
import { deletePlayerProfile, savePlayerProfiles, type PlayerProfile, type PlayerProfileInput } from '@/api/playerClient';
import { useTeams, useTeamRefresh, saveTeams } from '@/api/useTeams';
import { useArenaWriter } from '@/web3/useArenaWriter';
import { useRoleChecks } from '@/web3/useRoleChecks';
import {
  getCancelContestActionState,
  getClaimActionState,
  getCreateContestActionState,
  getFinalizeContestActionState
} from '@/utils/actionStates';
import {
  encodeTeamBytes32,
  formatDateTime,
  formatWire,
  parseWireInput,
  statusLabel,
  teamCodeFromBytes,
  toUnixSeconds
} from '@/utils/arenaFormat';
import { formatRelativeTime } from '@/utils/liveTime';
import { useNow } from '@/hooks/useNow';

const ROLE_TO_ID: Record<string, number> = { WK: 0, BAT: 1, AR: 2, BOWL: 3 };
const SIDE_TO_ID: Record<string, number> = { HOME: 1, AWAY: 2 };

/** Shown when a tx has been pending for >8s — almost always a stale MetaMask nonce after Anvil restart */
function NonceStalenessWarning({ hash }: { hash?: string }) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    setStale(false);
    const timer = setTimeout(() => setStale(true), 8_000);
    return () => clearTimeout(timer);
  }, [hash]);

  if (!stale) return null;
  return (
    <div className="mb-6 rounded-lg border border-orange-300 bg-orange-50 p-4 text-sm text-orange-900">
      <p className="font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Transaction stuck pending — likely a stale MetaMask nonce
      </p>
      <p className="mt-1 text-orange-800">
        After restarting Anvil, MetaMask may still remember old nonces. Fix:
      </p>
      <ol className="mt-2 ml-4 list-decimal space-y-1 text-orange-800">
        <li>Open MetaMask → Settings → Advanced</li>
        <li>Click <strong>"Clear activity tab data"</strong> (resets nonce cache)</li>
        <li>Reload the page and retry the transaction</li>
      </ol>
    </div>
  );
}


export function ProtocolView() {
  const roles = useRoleChecks();
  const writer = useArenaWriter();
  const [squadBaseUri, setSquadBaseUri] = useState('');
  const [passportBaseUri, setPassportBaseUri] = useState('');
  const [appOrigin, setAppOrigin] = useState('');
  const envSquadUri = process.env.NEXT_PUBLIC_SQUAD_BASE_URI ?? '';
  const envPassportUri = process.env.NEXT_PUBLIC_PASSPORT_BASE_URI ?? '';
  
  const defaultSquadUri = envSquadUri || (appOrigin ? `${appOrigin}/api/nft/squad/` : '');
  const defaultPassportUri = envPassportUri || (appOrigin ? `${appOrigin}/api/nft/passport/` : '');
  
  const squadTokenPreview = defaultSquadUri ? `${defaultSquadUri}1` : 'Not configured';
  const passportTokenPreview = defaultPassportUri ? `${defaultPassportUri}1` : 'Not configured';

  useEffect(() => {
    setAppOrigin(window.location.origin);
  }, []);


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
          <h2 className="font-bold text-slate-900 mb-4">Initialize Token URIs</h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Configure Token URIs across the protocol. Defaults are picked up from the <code>.env.local</code> namespace (e.g. Pinata Gateways or internal Routes).
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-3">
              <div>
                <p className="font-semibold text-slate-900">Target Squad URI</p>
                <p className="mt-1 break-all bg-white py-1 px-2 border border-slate-200 rounded">{defaultSquadUri || 'Waiting for config...'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Target Passport URI</p>
                <p className="mt-1 break-all bg-white py-1 px-2 border border-slate-200 rounded">{defaultPassportUri || 'Waiting for config...'}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (defaultSquadUri) {
                  writer.write({ address: contractAddresses.fantasyTeamNft, abi: fantasyTeamNftAbi, functionName: 'setBaseURI', args: [defaultSquadUri] });
                }
              }}
              disabled={!defaultSquadUri || writer.isBusy}
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Sync Squad URI
            </button>
            <button
              onClick={() => {
                if (defaultPassportUri) {
                  writer.write({ address: contractAddresses.legacyPassport, abi: legacyPassportAbi, functionName: 'setBaseURI', args: [defaultPassportUri] });
                }
              }}
              disabled={!defaultPassportUri || writer.isBusy}
              className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Sync Passport URI
            </button>
            
            {writer.hash && <p className="break-all text-xs text-slate-500">Tx: {writer.hash}</p>}
            {writer.error && <p className="text-xs text-red-600">{writer.error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export function MatchView() {
  const matches = useIndexedMatches();
  const contests = useIndexedContests();
  const indexerHealth = useIndexerHealth();
  const playerProfiles = usePlayerProfiles();
  const teamsQuery = useTeams();
  const refreshTeams = useTeamRefresh();
  const writer = useArenaWriter();
  const now = useNow();
  const matchOptions = matches.data ?? [];
  const contestOptions = contests.data ?? [];
  const matchById = useMemo(() => new Map(matchOptions.map((match) => [match.matchId, match])), [matchOptions]);
  const activeTeams = useMemo(() => (teamsQuery.data ?? []).filter((t) => t.active), [teamsQuery.data]);
  const [matchId, setMatchId] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [lockTime, setLockTime] = useState('');
  const [startTime, setStartTime] = useState('');
  const [playerPoolMatchId, setPlayerPoolMatchId] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerPoolError, setPlayerPoolError] = useState('');
  const [playerSelections, setPlayerSelections] = useState<Record<number, { selected: boolean; role: string; side: string }>>({});
  const [contestId, setContestId] = useState('');
  const [contestMatchId, setContestMatchId] = useState('');
  const [entryFee, setEntryFee] = useState('0.01');
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [newTeamCode, setNewTeamCode] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [teamSaving, setTeamSaving] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');

  useEffect(() => {
    setPlayerSelections({});
    setPlayerPoolError('');
  }, [playerPoolMatchId]);

  // Auto-determine home/away team codes for side assignment
  const selectedHomeTeam = activeTeams.find((t) => t.teamCode === homeTeam);
  const selectedAwayTeam = activeTeams.find((t) => t.teamCode === awayTeam);

  const activeProfiles = useMemo(() => (playerProfiles.data ?? []).filter((player) => player.active), [playerProfiles.data]);

  // Resolve the team codes for the selected player-pool match
  const poolMatch = useMemo(
    () => matchOptions.find((m) => m.matchId === playerPoolMatchId),
    [matchOptions, playerPoolMatchId]
  );
  const poolHomeCode = poolMatch ? teamCodeFromBytes(poolMatch.homeTeam, '').toUpperCase() : '';
  const poolAwayCode = poolMatch ? teamCodeFromBytes(poolMatch.awayTeam, '').toUpperCase() : '';

  const filteredProfiles = useMemo(() => {
    // When a match is selected, only show players from its two teams
    let source = activeProfiles;
    if (poolHomeCode && poolAwayCode) {
      source = source.filter((player) => {
        const code = (player.teamCode ?? '').toUpperCase();
        return code === poolHomeCode || code === poolAwayCode;
      });
    }
    const query = playerSearch.trim().toLowerCase();
    if (query) {
      source = source.filter((player) =>
        [player.playerId.toString(), player.name, player.teamCode ?? '', player.role ?? '']
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }
    return source.slice(0, 80);
  }, [activeProfiles, playerSearch, poolHomeCode, poolAwayCode]);
  const selectedProfileRows = useMemo(
    () =>
      Object.entries(playerSelections)
        .filter(([, value]) => value.selected)
        .map(([playerId, value]) => ({ playerId: Number(playerId), ...value }))
        .sort((a, b) => a.playerId - b.playerId),
    [playerSelections]
  );

  const matchSelectValue = matchOptions.some((match) => match.matchId === matchId) ? matchId : '';
  const playerPoolSelectValue = matchOptions.some((match) => match.matchId === playerPoolMatchId)
    ? playerPoolMatchId
    : '';
  const contestMatchSelectValue = matchOptions.some((match) => match.matchId === contestMatchId)
    ? contestMatchId
    : '';
  const contestTargetMatch = contestMatchId ? matchById.get(contestMatchId) : undefined;
  const createContestState = getCreateContestActionState(contestTargetMatch, writer.isBusy);
  const canCreateContest = Boolean(contestId && contestMatchId && entryFee && !createContestState.disabled);

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
    const homeLabel = selectedHomeTeam?.teamCode ?? homeTeam;
    const awayLabel = selectedAwayTeam?.teamCode ?? awayTeam;
    await writer.write({
      address: contractAddresses.matchRegistry,
      abi: matchRegistryAbi,
      functionName: 'createMatch',
      args: [BigInt(matchId), encodeTeamBytes32(homeLabel), encodeTeamBytes32(awayLabel), toUnixSeconds(startTime), toUnixSeconds(lockTime)]
    });
  };

  const togglePlayerSelection = (player: PlayerProfile, selected: boolean) => {
    setPlayerSelections((current) => {
      const currentValue = current[player.playerId];
      // Auto-determine side based on player's teamCode vs match teams
      let defaultSide = currentValue?.side ?? 'HOME';
      if (!currentValue?.side && player.teamCode) {
        if (player.teamCode.toUpperCase() === poolAwayCode) {
          defaultSide = 'AWAY';
        } else if (player.teamCode.toUpperCase() === poolHomeCode) {
          defaultSide = 'HOME';
        }
      }
      return {
        ...current,
        [player.playerId]: {
          selected,
          role: currentValue?.role ?? normalizeRole(player.role),
          side: defaultSide
        }
      };
    });
  };

  const updatePlayerSelection = (player: PlayerProfile, field: 'role' | 'side', value: string) => {
    setPlayerSelections((current) => {
      const currentValue = current[player.playerId];
      return {
        ...current,
        [player.playerId]: {
          selected: currentValue?.selected ?? true,
          role: field === 'role' ? value : currentValue?.role ?? normalizeRole(player.role),
          side: field === 'side' ? value : currentValue?.side ?? 'HOME'
        }
      };
    });
  };

  const submitSelectedPlayers = async () => {
    setPlayerPoolError('');
    if (selectedProfileRows.length === 0) {
      setPlayerPoolError('Select at least one database player.');
      return;
    }
    if (selectedProfileRows.length > 32) {
      setPlayerPoolError('A match player pool can include at most 32 players.');
      return;
    }

    const playerIds = selectedProfileRows.map((row) => row.playerId);
    const roles = selectedProfileRows.map((row) => {
      const roleId = ROLE_TO_ID[row.role];
      if (roleId === undefined) throw new Error(`Invalid role: ${row.role}`);
      return roleId;
    });
    const teamSides = selectedProfileRows.map((row) => {
      const sideId = SIDE_TO_ID[row.side];
      if (sideId === undefined) throw new Error(`Invalid side: ${row.side}`);
      return sideId;
    });

    await writer.write({
      address: contractAddresses.matchRegistry,
      abi: matchRegistryAbi,
      functionName: 'setMatchPlayers',
      args: [BigInt(playerPoolMatchId), playerIds, roles, teamSides]
    });
  };

  const selectAllBySide = (teamCode: string, side: 'HOME' | 'AWAY') => {
    const playersForTeam = activeProfiles.filter((p) => p.teamCode?.toUpperCase() === teamCode.toUpperCase());
    setPlayerSelections((current) => {
      const updates = { ...current };
      for (const player of playersForTeam) {
        updates[player.playerId] = {
          selected: true,
          role: updates[player.playerId]?.role ?? normalizeRole(player.role),
          side
        };
      }
      return updates;
    });
  };

  const addTeam = async () => {
    if (!newTeamCode.trim() || !newTeamName.trim()) return;
    setTeamSaving(true);
    setTeamMessage('');
    try {
      await saveTeams([{ teamCode: newTeamCode.trim().toUpperCase(), displayName: newTeamName.trim() }]);
      await refreshTeams();
      setTeamMessage(`Added ${newTeamCode.trim().toUpperCase()}`);
      setNewTeamCode('');
      setNewTeamName('');
    } catch (error) {
      setTeamMessage(error instanceof Error ? error.message : 'Failed to save team');
    } finally {
      setTeamSaving(false);
    }
  };

  const createContest = async () => {
    if (createContestState.disabled) return;
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

      {/* Nonce warning — shown when confirming takes too long (classic post-Anvil-restart issue) */}
      {writer.isConfirming && (
        <NonceStalenessWarning hash={writer.hash} />
      )}

      {writer.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{writer.error}</span>
        </div>
      )}

      <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Indexer status</p>
            <p className="text-slate-600">
              {indexerHealth.isError
                ? 'Offline or unreachable. Writes can still confirm on-chain, but tables will not update until Ponder is running.'
                : indexerHealth.data?.latestBlock
                  ? `Online · latest indexed block ${indexerHealth.data.latestBlock}`
                  : 'Online · waiting for indexed events'}
            </p>
          </div>
          {indexerHealth.data?.latestEvent && (
            <span className="rounded bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              {indexerHealth.data.latestEvent.contractName}.{indexerHealth.data.latestEvent.eventName}
            </span>
          )}
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ─── Create Match ─── */}
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
                  #{option.matchId} · {statusLabel(option.status)} · lock {formatRelativeTime(option.lockTime, now)}
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

            <label className="block text-xs font-semibold text-slate-600">Home team</label>
            <select
              value={homeTeam}
              onChange={(event) => setHomeTeam(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select home team</option>
              {activeTeams.filter((t) => t.teamCode !== awayTeam).map((t) => (
                <option key={t.teamCode} value={t.teamCode}>{t.displayName} ({t.teamCode})</option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-slate-600">Away team</label>
            <select
              value={awayTeam}
              onChange={(event) => setAwayTeam(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select away team</option>
              {activeTeams.filter((t) => t.teamCode !== homeTeam).map((t) => (
                <option key={t.teamCode} value={t.teamCode}>{t.displayName} ({t.teamCode})</option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-slate-600">Lock time</label>
            <input type="datetime-local" value={lockTime} onChange={(event) => setLockTime(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <label className="block text-xs font-semibold text-slate-600">Start time</label>
            <input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            {matchTimingError && <p className="text-xs text-red-600">{matchTimingError}</p>}
            <button
              onClick={() => {
                void createMatch().catch(() => {});
              }}
              disabled={writer.isBusy || !canCreateMatch}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create Match
            </button>

            {/* Inline team management toggle */}
            <button
              type="button"
              onClick={() => setShowTeamManager(!showTeamManager)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <span>Manage Teams</span>
              {showTeamManager ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showTeamManager && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                  {(teamsQuery.data ?? []).map((team) => (
                    <div key={team.teamCode} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div>
                        <span className="font-semibold text-slate-900">{team.teamCode}</span>
                        <span className="text-slate-500 ml-2">{team.displayName}</span>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${team.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {team.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                  {(teamsQuery.data ?? []).length === 0 && (
                    <p className="px-3 py-4 text-center text-sm text-slate-500">No teams yet. Add one below.</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={newTeamCode}
                    onChange={(event) => setNewTeamCode(event.target.value)}
                    placeholder="Code (e.g. LQ)"
                    className="w-full sm:w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    value={newTeamName}
                    onChange={(event) => setNewTeamName(event.target.value)}
                    placeholder="Display name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => { void addTeam(); }}
                    disabled={teamSaving || !newTeamCode.trim() || !newTeamName.trim()}
                    className="w-full sm:w-auto rounded-lg bg-slate-900 px-4 py-2 flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
                {teamMessage && <p className="text-xs text-slate-600">{teamMessage}</p>}
              </div>
            )}
          </div>
        </section>

        {/* ─── Set Player Pool (DB only) ─── */}
        <section className="rounded-lg border border-slate-200 p-5 lg:col-span-2 lg:row-start-2">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Database className="w-5 h-5 text-emerald-600" />Set Player Pool</h2>
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600">Match</label>
            <select
              value={playerPoolSelectValue}
              onChange={(event) => setPlayerPoolMatchId(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select match</option>
              {matchOptions.map((option) => (
                <option key={option.matchId} value={option.matchId}>
                  #{option.matchId} · {statusLabel(option.status)} · lock {formatRelativeTime(option.lockTime, now)}
                </option>
              ))}
            </select>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Select players from database</p>
                  <p className="text-xs text-slate-500">
                    {poolHomeCode && poolAwayCode
                      ? `Showing players from ${poolHomeCode} and ${poolAwayCode} only.`
                      : 'Select a match above to filter players by team.'}
                  </p>
                </div>
                <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                  {selectedProfileRows.length}/32 selected
                </span>
              </div>
              <input
                value={playerSearch}
                onChange={(event) => setPlayerSearch(event.target.value)}
                placeholder="Search by name, ID, role, or team"
                className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />

              {/* Quick select buttons */}
              {(poolHomeCode || poolAwayCode) && (
                <div className="mb-3 flex gap-2">
                  {poolHomeCode && (
                    <button
                      type="button"
                      onClick={() => selectAllBySide(poolHomeCode, 'HOME')}
                      className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Select all {poolHomeCode} (Home)
                    </button>
                  )}
                  {poolAwayCode && (
                    <button
                      type="button"
                      onClick={() => selectAllBySide(poolAwayCode, 'AWAY')}
                      className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Select all {poolAwayCode} (Away)
                    </button>
                  )}
                </div>
              )}

              <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                {filteredProfiles.map((player) => {
                  let defaultSide = 'HOME';
                  if (player.teamCode?.toUpperCase() === poolAwayCode) defaultSide = 'AWAY';
                  const selection = playerSelections[player.playerId] ?? {
                    selected: false,
                    role: normalizeRole(player.role),
                    side: defaultSide
                  };
                  return (
                    <div key={player.playerId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selection.selected}
                          onChange={(event) => togglePlayerSelection(player, event.target.checked)}
                          className="mt-1 flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight break-words">{player.name}</p>
                          <p className="text-xs text-slate-500 mt-1 break-words">#{player.playerId}{player.teamCode ? ` · ${player.teamCode}` : ''}{player.role ? ` · ${player.role}` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pl-6 sm:pl-0 shrink-0 w-full sm:w-auto">
                        <select
                          value={selection.role}
                          onChange={(event) => updatePlayerSelection(player, 'role', event.target.value)}
                          className="flex-1 sm:flex-none rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold sm:w-24"
                        >
                          {Object.keys(ROLE_TO_ID).map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <select
                          value={selection.side}
                          onChange={(event) => updatePlayerSelection(player, 'side', event.target.value)}
                          className="flex-1 sm:flex-none rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold sm:w-24"
                        >
                          <option value="HOME">Home</option>
                          <option value="AWAY">Away</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
                {!playerProfiles.isLoading && filteredProfiles.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-slate-500">No database players found.</p>
                )}
                {playerProfiles.isLoading && (
                  <p className="px-3 py-8 text-center text-sm text-slate-500">Loading player database...</p>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPlayerSelections({});
                    setPlayerPoolError('');
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Clear Selection
                </button>
                <span className="text-right text-xs text-slate-500 self-center">
                  {selectedProfileRows.length} player{selectedProfileRows.length !== 1 ? 's' : ''} ready
                </span>
              </div>
            </div>
            {playerPoolError && <p className="text-xs text-red-600">{playerPoolError}</p>}
            <button
              onClick={() => {
                void submitSelectedPlayers().catch(() => {});
              }}
              disabled={writer.isBusy || !playerPoolMatchId || selectedProfileRows.length === 0}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Set Players ({selectedProfileRows.length})
            </button>
          </div>
        </section>

        {/* ─── Create Contest ─── */}
        <section className="rounded-lg border border-slate-200 p-5 lg:col-start-2 lg:row-start-1">
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
              <option value="">Select match</option>
              {matchOptions.map((option) => (
                <option key={option.matchId} value={option.matchId}>
                  #{option.matchId} · {statusLabel(option.status)} · lock {formatRelativeTime(option.lockTime, now)}
                  {option.contestId ? ` · Contest #${option.contestId} exists` : ''}
                </option>
              ))}
            </select>
            {createContestState.reason ? <p className="text-xs text-amber-700">{createContestState.reason}</p> : null}
            <p className="text-xs text-slate-500">One contest per match is enforced on-chain.</p>
            <input value={entryFee} onChange={(event) => setEntryFee(event.target.value)} placeholder="Entry fee in WIRE" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <button
              onClick={() => {
                void createContest().catch(() => {});
              }}
              disabled={!canCreateContest}
              title={createContestState.reason}
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
                  <p className="text-sm text-slate-600">#{match.matchId} · {statusLabel(match.status)} · lock {formatRelativeTime(match.lockTime, now)}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(match.lockTime)}</p>
                </div>
                <span className="text-sm text-slate-500">{match.playerCount} players</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200"><h2 className="font-bold text-slate-900">Indexed Contests</h2></div>
          <div className="divide-y divide-slate-200">
            {(contests.data ?? []).map((contest) => {
              const matchForContest = matchById.get(contest.matchId);
              const finalizeState = getFinalizeContestActionState(contest, matchForContest, writer.isBusy);
              const cancelState = getCancelContestActionState(contest, matchForContest, writer.isBusy, now);
              const helper = finalizeState.helper ?? cancelState.helper;

              return (
                <div key={contest.id} className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Contest #{contest.contestId}</p>
                    <p className="text-sm text-slate-600">
                      Match #{contest.matchId} · {contest.totalEntries}/{contest.maxEntries} entries
                      {matchForContest ? ` · lock ${formatRelativeTime(matchForContest.lockTime, now)}` : ''}
                    </p>
                    {helper ? <p className="mt-1 text-xs font-medium text-amber-700">{helper}</p> : null}
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className="text-sm font-semibold text-slate-900">{formatWire(contest.entryFee)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'finalizeContest', args: [BigInt(contest.contestId)] })}
                        disabled={finalizeState.disabled}
                        title={finalizeState.reason}
                        className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Finalize
                      </button>
                      <button
                        onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'cancelContest', args: [BigInt(contest.contestId)] })}
                        disabled={cancelState.disabled}
                        title={cancelState.reason}
                        className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                    {finalizeState.reason && !helper ? <p className="max-w-xs text-right text-[11px] text-slate-500">{finalizeState.reason}</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

type PlayerFormState = {
  playerId: string;
  name: string;
  teamCode: string;
  role: PlayerProfileInput['role'];
  imageUrl: string;
  active: boolean;
};

const EMPTY_PLAYER_FORM: PlayerFormState = {
  playerId: '',
  name: '',
  teamCode: '',
  role: 'BAT',
  imageUrl: '',
  active: true
};

export function PlayerDatabaseView() {
  const queryClient = useQueryClient();
  const profiles = usePlayerProfiles();
  const teamsQuery = useTeams();
  const activeTeamsList = useMemo(() => (teamsQuery.data ?? []).filter((t) => t.active), [teamsQuery.data]);
  const [form, setForm] = useState<PlayerFormState>(EMPTY_PLAYER_FORM);
  const [bulkCsv, setBulkCsv] = useState('101,Babar Azam,PAK,BAT,/players/101.png\n102,Mohammad Rizwan,PAK,WK,/players/102.png');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const players = profiles.data ?? [];

  // Compute used IDs and next available ID
  const usedIds = useMemo(() => new Set(players.map((p) => p.playerId)), [players]);
  const existingFormPlayer = useMemo(() => {
    const playerId = Number(form.playerId);
    if (!Number.isFinite(playerId)) return null;
    return players.find((player) => player.playerId === playerId) ?? null;
  }, [form.playerId, players]);
  const nextAvailableId = useMemo(() => {
    let candidate = 1;
    while (usedIds.has(candidate)) candidate++;
    return candidate;
  }, [usedIds]);
  // Suggest a range of unused IDs near the end of existing IDs for the dropdown
  const unusedIdOptions = useMemo(() => {
    const maxExisting = players.length > 0 ? Math.max(...players.map((p) => p.playerId)) : 0;
    const options: number[] = [];
    // Add the very next available
    for (let i = 1; options.length < 20 && i <= maxExisting + 30; i++) {
      if (!usedIds.has(i)) options.push(i);
    }
    return options;
  }, [players, usedIds]);

  const setFormField = <K extends keyof PlayerFormState>(field: K, value: PlayerFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const refreshPlayers = async () => {
    await queryClient.invalidateQueries({ queryKey: ['players'] });
  };

  const saveSinglePlayer = async () => {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = buildPlayerPayload(form);
      await savePlayerProfiles([payload]);
      await refreshPlayers();
      setMessage(`Saved ${payload.name}.`);
      setForm(EMPTY_PLAYER_FORM);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save player');
    } finally {
      setSaving(false);
    }
  };

  const importBulkPlayers = async () => {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const payload = parsePlayerProfileCsv(bulkCsv);
      await savePlayerProfiles(payload);
      await refreshPlayers();
      setMessage(`Imported ${payload.length} players.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to import players');
    } finally {
      setSaving(false);
    }
  };

  const editPlayer = (player: PlayerProfile) => {
    setForm({
      playerId: player.playerId.toString(),
      name: player.name,
      teamCode: player.teamCode ?? '',
      role: normalizeRole(player.role) as PlayerProfileInput['role'],
      imageUrl: player.imageUrl ?? '',
      active: player.active
    });
    setMessage('');
    setError('');
  };

  const playerToInput = (player: PlayerProfile, active: boolean): PlayerProfileInput => ({
    playerId: player.playerId,
    name: player.name,
    teamCode: player.teamCode,
    role: player.role ? normalizeRole(player.role) as PlayerProfileInput['role'] : null,
    imageUrl: player.imageUrl,
    active,
    metadata: player.metadata
  });

  const setPlayerActive = async (player: PlayerProfile, active: boolean) => {
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await savePlayerProfiles([playerToInput(player, active)]);
      await refreshPlayers();
      setMessage(`${active ? 'Activated' : 'Deactivated'} ${player.name}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update player');
    } finally {
      setSaving(false);
    }
  };

  const hardDeletePlayer = async (player: PlayerProfile) => {
    const confirmed = window.confirm(
      `Delete ${player.name} (#${player.playerId}) from the database? Historical views will fall back to default metadata.`
    );
    if (!confirmed) return;

    setMessage('');
    setError('');
    setSaving(true);
    try {
      await deletePlayerProfile(player.playerId);
      await refreshPlayers();
      if (form.playerId === player.playerId.toString()) {
        setForm(EMPTY_PLAYER_FORM);
      }
      setMessage(`Deleted ${player.name}.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete player');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Player Database</h1>
        <p className="text-slate-600">Store off-chain names, teams, roles, and images for player IDs used by contracts</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <section className="xl:col-span-2 rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Create or update player</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Player ID</label>
              <div className="flex gap-2">
                <select
                  value={form.playerId}
                  onChange={(event) => setFormField('playerId', event.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select ID ({nextAvailableId} next)</option>
                  {unusedIdOptions.map((id) => (
                    <option key={id} value={id.toString()}>
                      {id}{id === nextAvailableId ? ' (next)' : ''}
                    </option>
                  ))}
                  {/* Allow editing existing player — show used IDs too */}
                  {form.playerId && usedIds.has(Number(form.playerId)) && (
                    <option value={form.playerId}>{form.playerId} (editing)</option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setFormField('playerId', nextAvailableId.toString())}
                  className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  Use next
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Display Name</label>
              <input
                value={form.name}
                onChange={(event) => setFormField('name', event.target.value)}
                placeholder="e.g. Babar Azam"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Team</label>
              <select
                value={form.teamCode}
                onChange={(event) => setFormField('teamCode', event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select team</option>
                {activeTeamsList.map((team) => (
                  <option key={team.teamCode} value={team.teamCode}>
                    {team.teamCode} — {team.displayName}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={form.role ?? 'BAT'}
              onChange={(event) => setFormField('role', event.target.value as PlayerProfileInput['role'])}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {Object.keys(ROLE_TO_ID).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <input
              value={form.imageUrl}
              onChange={(event) => setFormField('imageUrl', event.target.value)}
              placeholder="Image URL or /players/101.png"
              className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setFormField('active', event.target.checked)}
              />
              Active player
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveSinglePlayer}
              disabled={saving}
              className="mt-4 flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Save Player
            </button>
            {existingFormPlayer && (
              <button
                onClick={() => {
                  void hardDeletePlayer(existingFormPlayer);
                }}
                disabled={saving}
                className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 p-5">
          <h2 className="font-bold text-slate-900 mb-4">Bulk import</h2>
          <textarea
            value={bulkCsv}
            onChange={(event) => setBulkCsv(event.target.value)}
            rows={9}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
          />
          <p className="mt-2 text-xs text-slate-500">CSV: playerId,name,teamCode,role,imageUrl</p>
          <button
            onClick={importBulkPlayers}
            disabled={saving}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Import Players
          </button>
        </section>
      </div>

      {message && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <section className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="font-bold text-slate-900">Players</h2>
          <p className="text-sm text-slate-500">
            {players.length} profiles loaded from the player API. Deactivated players stay in the database but are hidden from match-pool selection.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {players.map((player) => (
                <tr key={player.playerId}>
                  <td className="px-4 py-3 font-mono text-slate-700">{player.playerId}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{player.name}</td>
                  <td className="px-4 py-3 text-slate-600">{player.teamCode ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{player.role ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-1 max-w-[220px] text-xs text-slate-500">{player.imageUrl ?? '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${player.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {player.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => editPlayer(player)}
                        className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { void setPlayerActive(player, !player.active); }}
                        disabled={saving}
                        className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {player.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => { void hardDeletePlayer(player); }}
                        disabled={saving}
                        className="rounded border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!profiles.isLoading && players.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    No player profiles found. Add players above, then select them in Match & Contest Operations.
                  </td>
                </tr>
              )}
              {profiles.isLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading player profiles...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function TreasuryView() {
  const summary = useIndexerSummary();
  const audit = useAuditEvents();
  const writer = useArenaWriter();
  const [newTreasury, setNewTreasury] = useState('');
  const treasury = summary.data?.treasury ?? null;
  const treasuryClaimState = getClaimActionState(
    treasury?.claimable ?? '0',
    writer.isBusy,
    'Treasury has no claimable WIRE right now.'
  );

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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Treasury & Audit</h1>
        <p className="text-slate-600">Claim treasury funds, update treasury address, and review protocol events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-slate-200 p-6">
          <Wallet className="w-5 h-5 text-teal-600 mb-3" />
          <p className="text-sm text-slate-600">Treasury claimable</p>
          <p className="text-2xl font-bold text-slate-900">{formatWire(treasury?.claimable ?? '0')}</p>
          <p className="mt-2 text-xs text-slate-500">Total claimed: {formatWire(treasury?.totalClaimed ?? '0')}</p>
          <button
            onClick={() => writer.write({ address: contractAddresses.contestManager, abi: contestManagerAbi, functionName: 'claimTreasury' })}
            disabled={treasuryClaimState.disabled}
            title={treasuryClaimState.reason}
            className="mt-4 w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Claim Treasury
          </button>
          {treasuryClaimState.reason ? <p className="mt-2 text-xs text-slate-500">{treasuryClaimState.reason}</p> : null}
        </div>

        <section className="rounded-lg border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-slate-600" />Treasury Address</h2>
          <p className="mb-3 break-all text-sm text-slate-600">Current: {treasury?.treasury ?? 'Not indexed yet'}</p>
          <input value={newTreasury} onChange={(event) => setNewTreasury(event.target.value)} placeholder="New treasury address" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={setTreasury} disabled={writer.isBusy || !newTreasury} className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Set Treasury</button>
          {writer.hash && <p className="mt-3 break-all text-xs text-slate-500">Tx: {writer.hash}</p>}
          {writer.error && <p className="mt-3 text-xs text-red-600">{writer.error}</p>}
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

function computeNextId(values: Array<string | number | bigint | null | undefined>): string {
  const numeric = values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (numeric.length === 0) return '';
  return String(Math.max(...numeric) + 1);
}

function normalizeRole(role: string | null | undefined): string {
  const normalized = role?.trim().toUpperCase();
  return normalized && normalized in ROLE_TO_ID ? normalized : 'BAT';
}

function buildPlayerPayload(form: PlayerFormState): PlayerProfileInput {
  const playerId = Number(form.playerId);
  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new Error('Player ID must be a positive integer');
  }
  const name = form.name.trim();
  if (!name) {
    throw new Error('Player name is required');
  }

  return {
    playerId,
    name,
    teamCode: optionalText(form.teamCode),
    role: form.role ?? null,
    imageUrl: optionalText(form.imageUrl),
    active: form.active,
    metadata: {}
  };
}

function parsePlayerProfileCsv(value: string): PlayerProfileInput[] {
  const rows = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    throw new Error('Bulk import cannot be empty');
  }

  return rows.map((line) => {
    const [id, name, teamCode, role, imageUrl] = line.split(',').map((part) => part.trim());
    const normalizedRole = role ? normalizeRole(role) as PlayerProfileInput['role'] : null;
    return buildPlayerPayload({
      playerId: id ?? '',
      name: name ?? '',
      teamCode: teamCode ?? '',
      role: normalizedRole,
      imageUrl: imageUrl ?? '',
      active: true
    });
  }).map((player, index, players) => {
    if (players.findIndex((candidate) => candidate.playerId === player.playerId) !== index) {
      throw new Error(`Duplicate player ID in import: ${player.playerId}`);
    }
    return player;
  });
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
