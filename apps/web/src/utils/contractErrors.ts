import { BaseError, ContractFunctionRevertedError } from "viem";
import { formatWire } from "@/utils/arenaFormat";

type RevertInfo = {
  errorName: string;
  args?: readonly unknown[];
};

function readRevertInfo(error: unknown): RevertInfo | null {
  if (!(error instanceof BaseError)) return null;

  const revertError = error.walk((innerError) => innerError instanceof ContractFunctionRevertedError);

  if (!(revertError instanceof ContractFunctionRevertedError)) return null;

  const data = revertError.data as { errorName?: string; args?: readonly unknown[] } | undefined;
  if (!data?.errorName) return null;

  return {
    errorName: data.errorName,
    args: data.args
  };
}

function pickRevertInfoFromMessage(message: string): RevertInfo | null {
  const knownErrors = [
    "MatchAlreadyHasContest",
    "MatchLocked",
    "StatsNotSubmitted",
    "NotEnoughEntries",
    "NoTreasuryBalance",
    "NoReward",
    "NoRefund",
    "ContestFull",
    "ContestCancelled",
    "ContestFinalizedAlready",
    "WalletEntryLimitReached",
    "WrongEntryFee",
    "InvalidSquadComposition",
    "CaptainNotInSquad",
    "ViceCaptainNotInSquad",
    "CaptainViceCaptainSame",
    "DuplicatePlayer",
    "PlayerNotAllowed"
  ];

  const errorName = knownErrors.find((name) => message.includes(name));
  return errorName ? { errorName } : null;
}

function formatRevertMessage({ errorName, args }: RevertInfo): string {
  switch (errorName) {
    case "MatchAlreadyHasContest":
      return args?.[0] !== undefined && args?.[1] !== undefined
        ? `Match #${String(args[0])} already has Contest #${String(args[1])}.`
        : "This match already has a contest.";
    case "MatchLocked":
      return args?.[0] !== undefined
        ? `Match #${String(args[0])} is locked.`
        : "This match is locked.";
    case "StatsNotSubmitted":
      return args?.[0] !== undefined
        ? `Submit scores for Match #${String(args[0])} before finalizing.`
        : "Submit match scores before finalizing.";
    case "NotEnoughEntries":
      return "At least 3 entries are required before finalization. Cancel before match start to make refunds available.";
    case "NoTreasuryBalance":
      return "Treasury has no claimable WIRE right now.";
    case "NoReward":
      return "No rewards are available to claim yet.";
    case "NoRefund":
      return "No refunds are available to claim.";
    case "ContestFull":
      return "This contest is already full.";
    case "ContestCancelled":
      return "This contest has already been cancelled.";
    case "ContestFinalizedAlready":
      return "This contest has already been finalized.";
    case "WalletEntryLimitReached":
      return "This wallet has reached the entry limit for the contest.";
    case "WrongEntryFee":
      return args?.[0] !== undefined && args?.[1] !== undefined
        ? `Wrong entry fee. Expected ${formatWire(args[0] as bigint | string | number)}, received ${formatWire(args[1] as bigint | string | number)}.`
        : "Wrong entry fee for this contest.";
    case "InvalidSquadComposition":
      return "Invalid squad composition. Use 1-4 WK, 3-6 BAT, 1-4 AR, 3-6 BOWL, and no more than 7 players from one team.";
    case "CaptainNotInSquad":
      return "Captain must be one of the selected players.";
    case "ViceCaptainNotInSquad":
      return "Vice captain must be one of the selected players.";
    case "CaptainViceCaptainSame":
      return "Captain and vice captain must be different players.";
    case "DuplicatePlayer":
      return args?.[0] !== undefined
        ? `Player #${String(args[0])} is selected more than once.`
        : "A player is selected more than once.";
    case "PlayerNotAllowed":
      return args?.[0] !== undefined && args?.[1] !== undefined
        ? `Player #${String(args[1])} is not allowed for Match #${String(args[0])}.`
        : "One selected player is not allowed for this match.";
    default:
      return errorName;
  }
}

export function normalizeContractError(error: unknown): string {
  const revertInfo = readRevertInfo(error);
  if (revertInfo) {
    return formatRevertMessage(revertInfo);
  }

  const message = error instanceof Error ? error.message : "";
  if (!message) return "Transaction failed.";

  const messageRevertInfo = pickRevertInfoFromMessage(message);
  if (messageRevertInfo) {
    return formatRevertMessage(messageRevertInfo);
  }

  if (message.match(/user rejected|user denied|rejected the request/i)) {
    return "Transaction rejected in wallet.";
  }

  if (message.match(/insufficient funds/i)) {
    return "Insufficient balance for this transaction.";
  }

  if (message.includes("0x04f5bd63")) {
    return formatRevertMessage({ errorName: "InvalidSquadComposition" });
  }
  if (message.includes("0x2f5f86d0")) {
    return formatRevertMessage({ errorName: "MatchLocked" });
  }

  return message;
}
