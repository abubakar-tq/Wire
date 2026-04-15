"use client";

import { Award, Gift, Trophy, Users, Wallet, Zap } from "lucide-react";
import type { AppState } from "@/types/index";
import { useCurrentUserPassport, useIndexedContests, useIndexedMatches } from "@/api/useIndexerData";
import { INDEXER_URL } from "@/api/indexerClient";
import { formatDateTime, formatWire, statusLabel, teamCodeFromBytes } from "@/utils/arenaFormat";
import { getPassportLevel } from "@/utils/passportLevel";

interface DashboardViewProps {
  state: AppState;
  onBuildSquad: (contestId: string) => void;
}

export function DashboardView({ state, onBuildSquad }: DashboardViewProps) {
  const matches = useIndexedMatches();
  const contests = useIndexedContests();
  const passport = useCurrentUserPassport();
  const openContests = (contests.data ?? []).filter((contest) => !contest.finalized && !contest.cancelled);
  const passportStats = passport.data?.passport ?? null;
  const balance = passport.data?.balance ?? null;
  const level = getPassportLevel(passportStats);
  const indexerUnavailable = matches.isError || contests.isError;

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-73px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">WireFluid Fantasy Arena</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold text-slate-900">Choose a match</h1>
            <p className="mt-2 text-sm text-slate-600">Build one squad per match, join an open contest, and track rewards through your passport.</p>
          </div>
        </header>

        {indexerUnavailable ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Indexer is unreachable at {INDEXER_URL}. Start the Ponder indexer to load matches and contests.
          </div>
        ) : null}

        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-5">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900">Open Contests</h2>
                <p className="text-sm text-slate-500">Pick a contest to start building your match squad.</p>
              </div>
              <Zap className="w-5 h-5 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-200">
              {openContests.map((contest) => {
                const match = (matches.data ?? []).find((item) => item.matchId === contest.matchId);
                return (
                  <div key={contest.id} className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {match ? `${teamCodeFromBytes(match.homeTeam, "HOME")} vs ${teamCodeFromBytes(match.awayTeam, "AWAY")}` : `Match #${contest.matchId}`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded bg-slate-100 px-2 py-1">Contest #{contest.contestId}</span>
                        <span className="rounded bg-slate-100 px-2 py-1">{formatWire(contest.entryFee)}</span>
                        <span className="rounded bg-slate-100 px-2 py-1">{contest.totalEntries}/{contest.maxEntries} entries</span>
                        {match ? <span className="rounded bg-slate-100 px-2 py-1">{statusLabel(match.status)}</span> : null}
                      </div>
                    </div>
                    <button
                      onClick={() => onBuildSquad(contest.contestId)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Build Squad
                    </button>
                  </div>
                );
              })}

              {openContests.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold text-slate-700">No open contests yet</p>
                  <p className="mt-1 text-sm text-slate-500">Once an operator creates a contest, it will appear here.</p>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="w-24 h-24 text-indigo-900" />
              </div>
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600/80">Legacy Passport</p>
                    <h2 className="mt-1 text-2xl font-black text-indigo-950">{level.name}</h2>
                    <p className="mt-1 text-xs font-medium text-indigo-700/70">{passportStats ? `Passport #${passportStats.tokenId}` : "Join a contest to mint"}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800 uppercase tracking-wide">
                    <span>{level.xp} XP</span>
                    <span>{level.nextMin ? `${level.nextMin} XP` : "Max level"}</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-indigo-200/60 overflow-hidden shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-600" style={{ width: `${level.progress}%` }} />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat label="Entries" value={passportStats?.contestsEntered.toString() ?? "0"} color="indigo" />
                  <MiniStat label="Wins" value={passportStats?.contestsWon.toString() ?? "0"} color="indigo" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Wallet className="w-4 h-4" />
                Claimable
              </div>
              <div className="mt-4 space-y-3">
                <ClaimRow icon={Gift} label="Rewards" value={formatWire(balance?.claimableReward ?? "0")} />
                <ClaimRow icon={Users} label="Refunds" value={formatWire(balance?.refundableAmount ?? "0")} />
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-900">Available Matches</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {(matches.data ?? []).slice(0, 6).map((match) => (
              <div key={match.id} className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{teamCodeFromBytes(match.homeTeam, "HOME")} vs {teamCodeFromBytes(match.awayTeam, "AWAY")}</p>
                  <p className="text-sm text-slate-500">Match #{match.matchId} · lock {formatDateTime(match.lockTime)}</p>
                </div>
                <span className="w-fit rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{statusLabel(match.status)}</span>
              </div>
            ))}
            {(matches.data ?? []).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No matches indexed yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = "slate" }: { label: string; value: string; color?: "slate" | "indigo" }) {
  const bgClass = color === "indigo" ? "bg-white/60 border-indigo-100" : "bg-slate-50 border-slate-200";
  const nameClass = color === "indigo" ? "text-indigo-600/80" : "text-slate-500";
  const valClass = color === "indigo" ? "text-indigo-950" : "text-slate-900";
  return (
    <div className={`rounded-xl border px-3 py-2 ${bgClass} backdrop-blur-sm`}>
      <p className={`text-[11px] font-bold uppercase tracking-wider ${nameClass}`}>{label}</p>
      <p className={`mt-1 text-lg font-black ${valClass}`}>{value}</p>
    </div>
  );
}

function ClaimRow({ icon: Icon, label, value }: { icon: typeof Gift; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
