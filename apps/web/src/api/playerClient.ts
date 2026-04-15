export type PlayerProfile = {
  playerId: number;
  name: string;
  teamCode: string | null;
  role: string | null;
  imageUrl: string | null;
  active: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type PlayerProfileInput = {
  playerId: number;
  name: string;
  teamCode?: string | null;
  role?: "WK" | "BAT" | "AR" | "BOWL" | null;
  imageUrl?: string | null;
  active?: boolean;
  metadata?: Record<string, unknown>;
};

export async function getPlayerProfiles(ids?: number[], init?: RequestInit): Promise<PlayerProfile[]> {
  const query = ids && ids.length ? `?ids=${ids.join(",")}` : "";
  const response = await fetch(`/api/players${query}`, {
    ...init,
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch players (${response.status})`);
  }
  const payload = (await response.json()) as { players?: PlayerProfile[] };
  return payload.players ?? [];
}

export async function savePlayerProfiles(players: PlayerProfileInput[], init?: RequestInit): Promise<PlayerProfile[]> {
  const response = await fetch("/api/players", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...init?.headers
    },
    body: JSON.stringify({ players }),
    ...init
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Failed to save players (${response.status})`);
  }

  const payload = (await response.json()) as { players?: PlayerProfile[] };
  return payload.players ?? [];
}
