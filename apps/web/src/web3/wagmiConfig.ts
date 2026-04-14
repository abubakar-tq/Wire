"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
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

const localAnvil1337 = defineChain({
  id: 1337,
  name: "WireFluid Local Anvil 1337",
  nativeCurrency: wireFluidTestnet.nativeCurrency,
  rpcUrls: wireFluidTestnet.rpcUrls,
  testnet: true
});

export const wagmiConfig =
  wireFluidTestnet.id === 31337
    ? createConfig({
        chains: [wireFluidTestnet, localAnvil1337] as const,
        connectors,
        ssr: true,
        transports: {
          [wireFluidTestnet.id]: http(wireFluidTestnet.rpcUrls.default.http[0]),
          [localAnvil1337.id]: http(wireFluidTestnet.rpcUrls.default.http[0])
        }
      })
    : createConfig({
        chains: [wireFluidTestnet] as const,
        connectors,
        ssr: true,
        transports: {
          [wireFluidTestnet.id]: http(wireFluidTestnet.rpcUrls.default.http[0])
        }
      });
