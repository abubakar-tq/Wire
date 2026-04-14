import { formatEther, parseEther, stringToHex } from "viem";

export const MATCH_STATUS_LABELS = ["Scheduled", "Locked", "StatsSubmitted", "Finalized", "Cancelled"] as const;
export const PLAYER_ROLE_LABELS = ["WK", "BAT", "AR", "BOWL"] as const;
export const TEAM_SIDE_LABELS: Record<number, string> = {
  1: "Home",
  2: "Away"
};

export function formatWire(value: bigint | string | number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) return "0 WIRE";
  const wei = typeof value === "bigint" ? value : BigInt(value);
  const amount = Number(formatEther(wei));
  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: decimals
  })} WIRE`;
}

export function parseWireInput(value: string): bigint {
  return parseEther(value.trim() || "0");
}

export function shortAddress(address: string | null | undefined): string {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDateTime(timestampSeconds: bigint | string | number | null | undefined): string {
  if (!timestampSeconds) return "Not set";
  const seconds = Number(timestampSeconds);
  if (!Number.isFinite(seconds) || seconds === 0) return "Not set";
  return new Date(seconds * 1000).toLocaleString();
}

export function statusLabel(status: number | null | undefined): string {
  return MATCH_STATUS_LABELS[status ?? 0] ?? "Unknown";
}

export function roleLabel(role: number | null | undefined): string {
  return PLAYER_ROLE_LABELS[role ?? 0] ?? "Unknown";
}

export function teamSideLabel(side: number | null | undefined): string {
  return TEAM_SIDE_LABELS[side ?? 0] ?? "Unknown";
}

export function encodeTeamBytes32(label: string): `0x${string}` {
  const normalized = label.trim();
  if (!normalized) return "0x0000000000000000000000000000000000000000000000000000000000000000";
  return stringToHex(normalized, { size: 32 });
}

export function decodeBytes32Text(value: `0x${string}` | string | null | undefined): string {
  if (!value || value === "0x") return "";
  const hex = value.startsWith("0x") ? value.slice(2) : value;
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    const byte = Number.parseInt(hex.slice(i, i + 2), 16);
    if (byte === 0 || Number.isNaN(byte)) break;
    bytes.push(byte);
  }
  return new TextDecoder().decode(Uint8Array.from(bytes));
}

export function toUint16Array11(values: number[]): readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
] {
  if (values.length !== 11) {
    throw new Error("Squad must contain exactly 11 players");
  }
  return values as unknown as readonly [number, number, number, number, number, number, number, number, number, number, number];
}

export function toUnixSeconds(value: string): bigint {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) throw new Error("Invalid date");
  return BigInt(Math.floor(timestamp / 1000));
}

export function safePlayerName(playerId: number): string {
  return `Player ${playerId}`;
}

export function teamCodeFromBytes(value: `0x${string}` | string | null | undefined, fallback: string): string {
  return decodeBytes32Text(value).trim() || fallback;
}
