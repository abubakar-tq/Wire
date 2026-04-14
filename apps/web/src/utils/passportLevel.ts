import type { IndexedPassport } from "@/api/indexerClient";

export type PassportLevel = {
  name: "Rookie" | "Contender" | "Pro" | "Elite" | "Legend";
  xp: number;
  currentMin: number;
  nextMin: number | null;
  progress: number;
};

const TIERS = [
  { name: "Rookie", min: 0 },
  { name: "Contender", min: 50 },
  { name: "Pro", min: 150 },
  { name: "Elite", min: 350 },
  { name: "Legend", min: 750 }
] as const;

export function getPassportLevel(passport: Pick<IndexedPassport, "contestsEntered" | "contestsWon"> | null): PassportLevel {
  const xp = passport ? passport.contestsEntered * 10 + passport.contestsWon * 50 : 0;
  let tierIndex = 0;
  for (let index = 0; index < TIERS.length; index += 1) {
    const tier = TIERS[index];
    if (tier && xp >= tier.min) {
      tierIndex = index;
    }
  }
  const current = TIERS[tierIndex] ?? TIERS[0];
  const next = TIERS[tierIndex + 1] ?? null;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(100, Math.round(((xp - current.min) / span) * 100)) : 100;

  return {
    name: current.name,
    xp,
    currentMin: current.min,
    nextMin: next?.min ?? null,
    progress
  };
}
