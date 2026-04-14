import { defineChain } from "viem";

export const WIREFLUID_TESTNET_CHAIN_ID = 92533;
export const WIREFLUID_TESTNET_RPC_URL = "https://evm.wirefluid.com";

export const wireFluidTestnet = defineChain({
  id: WIREFLUID_TESTNET_CHAIN_ID,
  name: "WireFluid Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "WIRE",
    symbol: "WIRE"
  },
  rpcUrls: {
    default: {
      http: [WIREFLUID_TESTNET_RPC_URL]
    },
    public: {
      http: [WIREFLUID_TESTNET_RPC_URL]
    }
  },
  testnet: true
});
