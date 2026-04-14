import {
  contestManagerAbi,
  fantasyTeamNftAbi,
  getContractAddresses,
  getWireFluidChain,
  legacyPassportAbi,
  matchRegistryAbi,
  scoreManagerAbi
} from "@wirefluid/contracts";
import { createConfig } from "ponder";

const isCodegen = process.argv.some((arg) => arg.includes("codegen"));
const chain = getWireFluidChain(process.env);
const addresses = getContractAddresses(process.env, { strict: !isCodegen });
const startBlock = Number(process.env.PONDER_START_BLOCK ?? "0");
const rpc = chain.rpcUrls.default.http[0];

export default createConfig({
  chains: {
    wireFluid: {
      id: chain.id,
      rpc,
      pollingInterval: 2_000
    }
  },
  contracts: {
    MatchRegistry: {
      abi: matchRegistryAbi,
      chain: "wireFluid",
      address: addresses.matchRegistry,
      startBlock
    },
    FantasyTeamNFT: {
      abi: fantasyTeamNftAbi,
      chain: "wireFluid",
      address: addresses.fantasyTeamNft,
      startBlock
    },
    LegacyPassport: {
      abi: legacyPassportAbi,
      chain: "wireFluid",
      address: addresses.legacyPassport,
      startBlock
    },
    ScoreManager: {
      abi: scoreManagerAbi,
      chain: "wireFluid",
      address: addresses.scoreManager,
      startBlock
    },
    ContestManager: {
      abi: contestManagerAbi,
      chain: "wireFluid",
      address: addresses.contestManager,
      startBlock
    }
  }
});
