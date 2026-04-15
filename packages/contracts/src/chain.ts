import { defineChain } from "viem";

export const ANVIL_CHAIN_ID = 31337;
export const WIREFLUID_TESTNET_CHAIN_ID = 92533;
export const WIREFLUID_TESTNET_RPC_URL = "https://evm.wirefluid.com";
export const ANVIL_RPC_URL = "http://127.0.0.1:8545";

type Env = Record<string, string | undefined>;

type ConfigOptions = {
  publicPrefix?: boolean;
};

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

export function readWireFluidChainId(env: Env, options: ConfigOptions = {}): number {
  const primaryKey = options.publicPrefix ? "NEXT_PUBLIC_WIREFLUID_CHAIN_ID" : "WIREFLUID_CHAIN_ID";
  const fallbackKey = options.publicPrefix ? "WIREFLUID_CHAIN_ID" : "NEXT_PUBLIC_WIREFLUID_CHAIN_ID";
  const raw = env[primaryKey] ?? env[fallbackKey];
  if (!raw) {
    const rpc = readRpcFromEnv(env, options);
    return rpc && isLocalRpc(rpc) ? ANVIL_CHAIN_ID : WIREFLUID_TESTNET_CHAIN_ID;
  }

  const chainId = Number(raw);
  if (!Number.isInteger(chainId) || chainId <= 0) {
    throw new Error(`${primaryKey} must be a positive integer`);
  }
  return chainId;
}

export function readWireFluidRpcUrl(env: Env, options: ConfigOptions = {}): string {
  const rpc = readRpcFromEnv(env, options);
  if (rpc) {
    return rpc;
  }
  return defaultRpcForChain(readWireFluidChainId(env, options));
}

function readRpcFromEnv(env: Env, options: ConfigOptions): string | undefined {
  const primaryKey = options.publicPrefix ? "NEXT_PUBLIC_WIREFLUID_RPC_URL" : "WIREFLUID_RPC_URL";
  const fallbackKey = options.publicPrefix ? "WIREFLUID_RPC_URL" : "NEXT_PUBLIC_WIREFLUID_RPC_URL";
  return env[primaryKey] ?? env[fallbackKey];
}

function isLocalRpc(rpcUrl: string): boolean {
  return rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost");
}

export function getWireFluidChain(env: Env, options: ConfigOptions = {}) {
  const id = readWireFluidChainId(env, options);
  const rpcUrl = readWireFluidRpcUrl(env, options);
  const isLocal = isLocalRpc(rpcUrl);

  return defineChain({
    id,
    name: isLocal ? "WireFluid Local Fork" : wireFluidTestnet.name,
    nativeCurrency: wireFluidTestnet.nativeCurrency,
    rpcUrls: {
      default: {
        http: [rpcUrl]
      },
      public: {
        http: [rpcUrl]
      }
    },
    testnet: true
  });
}

function defaultRpcForChain(chainId: number): string {
  return chainId === ANVIL_CHAIN_ID ? ANVIL_RPC_URL : WIREFLUID_TESTNET_RPC_URL;
}
