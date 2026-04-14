import { wireFluidTestnet as baseWireFluidTestnet } from "@wirefluid/contracts";
import { defineChain } from "viem";

const rpcUrl = process.env.NEXT_PUBLIC_WIREFLUID_RPC_URL ?? baseWireFluidTestnet.rpcUrls.default.http[0];

export const wireFluidTestnet = defineChain({
  ...baseWireFluidTestnet,
  rpcUrls: {
    default: {
      http: [rpcUrl]
    },
    public: {
      http: [rpcUrl]
    }
  }
});
