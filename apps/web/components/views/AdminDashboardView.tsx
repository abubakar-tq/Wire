'use client';

import { Activity, AlertCircle, BadgeCheck, Database, Settings2, Trophy, Wallet } from 'lucide-react';
import { useIndexerSummary, useAuditEvents } from '@/api/useIndexerData';
import { INDEXER_URL } from '@/api/indexerClient';
import { useRoleChecks } from '@/web3/useRoleChecks';
import { formatDateTime, formatWire, statusLabel, teamCodeFromBytes } from '@/utils/arenaFormat';
import { useSiweSession } from '@/auth/useSiweSession';
import { useCurrentUserPassport } from '@/api/useIndexerData';
import type { ViewType } from '@/types/index';

interface AdminDashboardViewProps {
  onViewChange: (view: ViewType) => void;
}

export function AdminDashboardView({ onViewChange }: AdminDashboardViewProps) {
  const summary = useIndexerSummary();
  const audit = useAuditEvents();
  const roles = useRoleChecks();
  const auth = useSiweSession();
  const passport = useCurrentUserPassport();
  const matches = summary.data?.recentMatches ?? [];
  const contests = summary.data?.recentContests ?? [];
  const treasury = summary.data?.treasury ?? null;
  const pendingFinalization = contests.filter((contest) => !contest.finalized && !contest.cancelled && contest.totalEntries >= 3);
  const waitingForStats = matches.filter((match) => match.status === 0 || match.status === 1);
  const indexerUnavailable = summary.isError || audit.isError;

  const metrics = [
    { label: 'Recent matches', value: matches.length.toString(), icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Open contests', value: contests.filter((contest) => !contest.finalized && !contest.cancelled).length.toString(), icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ready to finalize', value: pendingFinalization.length.toString(), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Treasury claimable', value: formatWire(treasury?.claimable ?? '0'), icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 text-lg">Protocol operations, indexed events, and pending actions</p>
        </div>

        {indexerUnavailable ? (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Indexer is unreachable at {INDEXER_URL}. Start the Ponder indexer to refresh admin metrics.
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900">Admin Access</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="Admin verification" value={auth.authenticated ? 'Verified' : 'Not verified'} />
              <InfoRow label="Wallet" value={auth.session?.address ?? 'Connect wallet first'} />
              <InfoRow label="LegacyPassport" value={passport.data?.passport ? `#${passport.data.passport.tokenId}` : 'No passport yet'} />
              <InfoRow
                label="Admin roles"
                value={
                  !roles.ready
                    ? 'Checking'
                    : roles.admin || roles.operator || roles.scorePublisher || roles.treasury
                      ? 'Granted'
                      : 'Missing'
                }
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
            <h2 className="font-bold mb-3">Visibility Notes</h2>
            <p className="text-sm text-slate-300">This panel is powered by the local indexer. If it is empty, the issue is usually Ponder or the contract addresses, not the UI.</p>
            <button
              onClick={async () => {
                if (auth.authenticated) {
                  await auth.signOut();
                } else {
                  await auth.signIn();
                }
              }}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"
            >
              {auth.authenticated ? 'Sign out' : 'Verify admin'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => onViewChange('MATCH')}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
          >
            <p className="text-sm font-semibold text-slate-900">Manage Matches</p>
            <p className="text-xs text-slate-600 mt-1">Create match, set player pool, create contest</p>
          </button>
          <button
            onClick={() => onViewChange('SCORE')}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
          >
            <p className="text-sm font-semibold text-slate-900">Publish Scores</p>
            <p className="text-xs text-slate-600 mt-1">Submit match results and fantasy points inputs</p>
          </button>
          <button
            onClick={() => onViewChange('TREASURY')}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
          >
            <p className="text-sm font-semibold text-slate-900">Treasury & Payouts</p>
            <p className="text-xs text-slate-600 mt-1">Finalize, cancel, claim treasury/rewards/refunds</p>
          </button>
          <button
            onClick={() => onViewChange('PROTOCOL')}
            className="rounded-lg border border-slate-200 bg-white p-4 text-left hover:bg-slate-50"
          >
            <p className="text-sm font-semibold text-slate-900">Contracts & Roles</p>
            <p className="text-xs text-slate-600 mt-1">Role checks, base URI, deployment diagnostics</p>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${metric.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{metric.value}</p>
                <p className="text-sm text-slate-600 mt-1">{metric.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <section className="xl:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900">Recent Matches</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Match</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Lock</th>
                    <th className="px-4 py-3 text-left">Contest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {teamCodeFromBytes(match.homeTeam, 'HOME')} vs {teamCodeFromBytes(match.awayTeam, 'AWAY')}
                        <p className="text-xs text-slate-500">#{match.matchId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{statusLabel(match.status)}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(match.lockTime)}</td>
                      <td className="px-4 py-3 text-slate-600">{match.contestId ?? 'None'}</td>
                    </tr>
                  ))}
                  {matches.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No indexed matches yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900">Role Health</h2>
            </div>
            <div className="space-y-3">
              {([
                ['Admin', roles.admin],
                ['Operator', roles.operator],
                ['Score publisher', roles.scorePublisher],
                ['Treasury', roles.treasury],
              ] as const).map(([label, enabled]) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <span className="text-sm text-slate-700">{label}</span>
                  <span className={`rounded px-2 py-1 text-xs font-semibold ${!roles.ready ? 'bg-blue-50 text-blue-700' : enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {!roles.ready ? 'Checking' : enabled ? 'Granted' : 'Missing'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">Recent Contests</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {contests.slice(0, 6).map((contest) => (
                <div key={contest.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">Contest #{contest.contestId}</p>
                    <p className="text-sm text-slate-600">Match #{contest.matchId} · {contest.totalEntries}/{contest.maxEntries} entries</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatWire(contest.entryFee)}</span>
                </div>
              ))}
              {contests.length === 0 && <p className="p-6 text-center text-slate-500">No indexed contests yet.</p>}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">Recent Events</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {(audit.data ?? []).slice(0, 8).map((event) => (
                <div key={event.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{event.contractName}.{event.eventName}</p>
                    <span className="text-xs text-slate-500">Block {event.blockNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500 break-all mt-1">{event.transactionHash}</p>
                </div>
              ))}
              {(audit.data ?? []).length === 0 && <p className="p-6 text-center text-slate-500">No events indexed yet.</p>}
            </div>
          </section>
        </div>

        {(summary.isError || audit.isError) && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Indexer data is unavailable. Check `NEXT_PUBLIC_INDEXER_URL` and the Ponder service.
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
