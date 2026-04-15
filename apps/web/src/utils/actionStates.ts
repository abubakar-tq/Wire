import type { IndexedContest, IndexedMatch } from "@/api/indexerClient";

export type UiActionState = {
  disabled: boolean;
  reason?: string;
  helper?: string;
};

function asBigInt(value: bigint | string | number | null | undefined): bigint {
  if (value === null || value === undefined) return 0n;
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

export function getClaimActionState(
  amount: bigint | string | number | null | undefined,
  isBusy: boolean,
  zeroMessage: string
): UiActionState {
  if (isBusy) {
    return {
      disabled: true,
      reason: "Wait for the pending transaction to finish."
    };
  }

  if (asBigInt(amount) === 0n) {
    return {
      disabled: true,
      reason: zeroMessage
    };
  }

  return { disabled: false };
}

export function getFinalizeContestActionState(
  contest: IndexedContest,
  match: IndexedMatch | undefined,
  isBusy: boolean
): UiActionState {
  if (isBusy) {
    return {
      disabled: true,
      reason: "Wait for the pending transaction to finish."
    };
  }

  if (contest.finalized) {
    return {
      disabled: true,
      reason: "This contest is already finalized."
    };
  }

  if (contest.cancelled) {
    return {
      disabled: true,
      reason: "This contest has already been cancelled."
    };
  }

  if (!match) {
    return {
      disabled: true,
      reason: "Match data is still loading."
    };
  }

  if (contest.totalEntries < 3) {
    return {
      disabled: true,
      reason: "At least 3 entries are required before finalization.",
      helper: "Cancel the contest before match start to make pull refunds available to entrants."
    };
  }

  if (match.status < 2) {
    return {
      disabled: true,
      reason: "Submit match scores before finalizing."
    };
  }

  return { disabled: false };
}

export function getCancelContestActionState(
  contest: IndexedContest,
  match: IndexedMatch | undefined,
  isBusy: boolean,
  now = Date.now()
): UiActionState {
  if (isBusy) {
    return {
      disabled: true,
      reason: "Wait for the pending transaction to finish."
    };
  }

  if (contest.finalized) {
    return {
      disabled: true,
      reason: "Finalized contests cannot be cancelled."
    };
  }

  if (contest.cancelled) {
    return {
      disabled: true,
      reason: "This contest has already been cancelled."
    };
  }

  if (!match) {
    return {
      disabled: true,
      reason: "Match data is still loading."
    };
  }

  if (Number(match.startTime) * 1000 <= now) {
    return {
      disabled: true,
      reason: "Cancellation is only available before match start."
    };
  }

  return contest.totalEntries < 3
    ? {
        disabled: false,
        helper: "Cancelling this contest will make pull refunds available to all current entrants."
      }
    : { disabled: false };
}

export function getCreateContestActionState(
  match: IndexedMatch | undefined,
  isBusy: boolean
): UiActionState {
  if (isBusy) {
    return {
      disabled: true,
      reason: "Wait for the pending transaction to finish."
    };
  }

  if (match?.contestId) {
    return {
      disabled: true,
      reason: `Match #${match.matchId} already has Contest #${match.contestId}.`
    };
  }

  return { disabled: false };
}
