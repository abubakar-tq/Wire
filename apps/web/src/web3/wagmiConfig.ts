"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { wireFluidTestnet } from "@/chains/wireFluidTestnet";

export const wagmiConfig = getDefaultConfig({
  appName: "WireFluid Fantasy Arena",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "wirefluid-fantasy-arena-local",
  chains: [wireFluidTestnet],
  ssr: true
});
