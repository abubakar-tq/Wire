"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export type TeamProfile = {
  teamCode: string;
  displayName: string;
  shortName: string | null;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TeamInput = {
  teamCode: string;
  displayName: string;
  shortName?: string | null;
  logoUrl?: string | null;
  active?: boolean;
};

async function fetchTeams(): Promise<TeamProfile[]> {
  const response = await fetch("/api/teams", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch teams (${response.status})`);
  }
  const payload = (await response.json()) as { teams?: TeamProfile[] };
  return payload.teams ?? [];
}

export async function saveTeams(teams: TeamInput[]): Promise<TeamProfile[]> {
  const response = await fetch("/api/teams", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ teams })
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Failed to save teams (${response.status})`);
  }
  const payload = (await response.json()) as { teams?: TeamProfile[] };
  return payload.teams ?? [];
}

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    staleTime: 60_000
  });
}

export function useTeamRefresh() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["teams"] });
}
