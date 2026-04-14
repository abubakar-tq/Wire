"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { wireFluidTestnet } from "@/chains/wireFluidTestnet";

const appName = "WireFluid Fantasy Arena";

const connectors = connectorsForWallets([
  {
    groupName: "Installed wallets",
    wallets: [injectedWallet]
  }
], {
  appName,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "wirefluid-fantasy-arena-local"
});

export const wagmiConfig = createConfig({
  chains: [wireFluidTestnet],
  connectors,
  ssr: true,
  transports: {
    [wireFluidTestnet.id]: http(wireFluidTestnet.rpcUrls.default.http[0])
  }
});
