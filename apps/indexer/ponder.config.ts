import {
  contestManagerAbi,
  fantasyTeamNftAbi,
  getContractAddresses,
  legacyPassportAbi,
  matchRegistryAbi,
  scoreManagerAbi,
  WIREFLUID_TESTNET_CHAIN_ID,
  WIREFLUID_TESTNET_RPC_URL
} from "@wirefluid/contracts";
import { createConfig } from "ponder";

const isCodegen = process.argv.some((arg) => arg.includes("codegen"));
const addresses = getContractAddresses(process.env, { strict: !isCodegen });
const startBlock = Number(process.env.PONDER_START_BLOCK ?? "0");
const rpc = process.env.WIREFLUID_RPC_URL ?? WIREFLUID_TESTNET_RPC_URL;

export default createConfig({
  chains: {
    wireFluidTestnet: {
      id: WIREFLUID_TESTNET_CHAIN_ID,
      rpc,
      pollingInterval: 2_000
    }
  },
  contracts: {
    MatchRegistry: {
      abi: matchRegistryAbi,
      chain: "wireFluidTestnet",
      address: addresses.matchRegistry,
      startBlock
    },
    FantasyTeamNFT: {
      abi: fantasyTeamNftAbi,
      chain: "wireFluidTestnet",
      address: addresses.fantasyTeamNft,
      startBlock
    },
    LegacyPassport: {
      abi: legacyPassportAbi,
      chain: "wireFluidTestnet",
      address: addresses.legacyPassport,
      startBlock
    },
    ScoreManager: {
      abi: scoreManagerAbi,
      chain: "wireFluidTestnet",
      address: addresses.scoreManager,
      startBlock
    },
    ContestManager: {
      abi: contestManagerAbi,
      chain: "wireFluidTestnet",
      address: addresses.contestManager,
      startBlock
    }
  }
});
