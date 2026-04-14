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
