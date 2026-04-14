import { useQuery } from "@tanstack/react-query";
import { getPlayerProfiles } from "@/api/playerClient";

export function usePlayerProfiles(playerIds?: number[]) {
  const idsKey = playerIds?.length ? playerIds.join(",") : "all";
  return useQuery({
    queryKey: ["players", idsKey],
    queryFn: () => getPlayerProfiles(playerIds),
    enabled: Boolean(playerIds === undefined || playerIds.length > 0),
    refetchInterval: 30_000
  });
}
