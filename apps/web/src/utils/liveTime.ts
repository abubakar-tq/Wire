type TimestampLike = bigint | string | number | null | undefined;

function toTimestampMs(value: TimestampLike): number | null {
  if (value === null || value === undefined) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return seconds * 1000;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (totalMinutes < 60) return `${totalMinutes}m ${seconds}s`;

  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (totalHours < 24) return `${totalHours}h ${minutes}m`;

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h`;
}

export function formatRelativeTime(value: TimestampLike, now = Date.now()): string {
  const timestampMs = toTimestampMs(value);
  if (timestampMs === null) return "time unavailable";

  const deltaMs = timestampMs - now;
  if (Math.abs(deltaMs) < 1_000) return "now";

  const duration = formatDuration(Math.abs(deltaMs));
  return deltaMs > 0 ? `in ${duration}` : `${duration} ago`;
}
