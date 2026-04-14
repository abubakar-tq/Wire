import { getAddress, isAddress, zeroAddress, type Address } from "viem";
import anvilDeployment from "../deployments/31337.json";
import wireFluidTestnetDeployment from "../deployments/92533.json";
import { arenaAbis } from "./abis";
import type { ContractAddresses } from "./addresses";
import { readWireFluidChainId, WIREFLUID_TESTNET_CHAIN_ID } from "./chain";

type Env = Record<string, string | undefined>;

type DeploymentContractAddresses = {
  matchRegistry: string;
  fantasyTeamNft: string;
  scoreManager: string;
  legacyPassport: string;
  contestManager: string;
};

export type ArenaDeploymentJson = {
  chainId: number;
  network: string;
  deployer: string;
  generatedAt: number;
  contracts: DeploymentContractAddresses;
};

export type ArenaDeployment = ArenaDeploymentJson & {
  contracts: ContractAddresses;
  abis: typeof arenaAbis;
};

const deployments = [anvilDeployment, wireFluidTestnetDeployment] as const satisfies readonly ArenaDeploymentJson[];

export function getDeploymentForChain(chainId: number): ArenaDeploymentJson | null {
  return deployments.find((deployment) => deployment.chainId === chainId) ?? null;
}

export function getDeploymentAddresses(chainId: number): ContractAddresses {
  const deployment = getDeploymentForChain(chainId);
  return {
    matchRegistry: readDeploymentAddress(deployment?.contracts.matchRegistry),
    fantasyTeamNft: readDeploymentAddress(deployment?.contracts.fantasyTeamNft),
    legacyPassport: readDeploymentAddress(deployment?.contracts.legacyPassport),
    scoreManager: readDeploymentAddress(deployment?.contracts.scoreManager),
    contestManager: readDeploymentAddress(deployment?.contracts.contestManager)
  };
}

export function getArenaDeployment(env: Env = {}, options: { publicPrefix?: boolean } = {}): ArenaDeployment {
  const chainId = readWireFluidChainId(env, options);
  const deployment = getDeploymentForChain(chainId) ?? getDeploymentForChain(WIREFLUID_TESTNET_CHAIN_ID);
  const contracts = getDeploymentAddresses(chainId);

  return {
    chainId,
    network: deployment?.network ?? "custom",
    deployer: deployment?.deployer ?? zeroAddress,
    generatedAt: deployment?.generatedAt ?? 0,
    contracts,
    abis: arenaAbis
  };
}

function readDeploymentAddress(value: string | undefined): Address {
  if (!value || value === zeroAddress) {
    return zeroAddress;
  }
  if (!isAddress(value)) {
    throw new Error(`Invalid deployment address: ${value}`);
  }
  return getAddress(value);
}
