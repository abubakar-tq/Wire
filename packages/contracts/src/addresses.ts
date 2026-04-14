import { getAddress, isAddress, zeroAddress, type Address } from "viem";

export type ContractAddresses = {
  matchRegistry: Address;
  fantasyTeamNft: Address;
  legacyPassport: Address;
  scoreManager: Address;
  contestManager: Address;
};

type AddressEnv = Record<string, string | undefined>;

type AddressOptions = {
  publicPrefix?: boolean;
  strict?: boolean;
};

const addressKeys = {
  matchRegistry: ["MATCH_REGISTRY", "NEXT_PUBLIC_MATCH_REGISTRY"],
  fantasyTeamNft: ["FANTASY_TEAM_NFT", "NEXT_PUBLIC_FANTASY_TEAM_NFT"],
  legacyPassport: ["LEGACY_PASSPORT", "NEXT_PUBLIC_LEGACY_PASSPORT"],
  scoreManager: ["SCORE_MANAGER", "NEXT_PUBLIC_SCORE_MANAGER"],
  contestManager: ["CONTEST_MANAGER", "NEXT_PUBLIC_CONTEST_MANAGER"]
} as const;

export function getContractAddresses(env: AddressEnv, options: AddressOptions = {}): ContractAddresses {
  return {
    matchRegistry: readAddress(env, addressKeys.matchRegistry, "MATCH_REGISTRY", options),
    fantasyTeamNft: readAddress(env, addressKeys.fantasyTeamNft, "FANTASY_TEAM_NFT", options),
    legacyPassport: readAddress(env, addressKeys.legacyPassport, "LEGACY_PASSPORT", options),
    scoreManager: readAddress(env, addressKeys.scoreManager, "SCORE_MANAGER", options),
    contestManager: readAddress(env, addressKeys.contestManager, "CONTEST_MANAGER", options)
  };
}

export function hasConfiguredAddresses(addresses: ContractAddresses): boolean {
  return Object.values(addresses).every((address) => address !== zeroAddress);
}

function readAddress(
  env: AddressEnv,
  keys: readonly [string, string],
  label: string,
  options: AddressOptions
): Address {
  const key = options.publicPrefix ? keys[1] : keys[0];
  const fallbackKey = options.publicPrefix ? keys[0] : keys[1];
  const raw = env[key] ?? env[fallbackKey];

  if (!raw || raw === zeroAddress) {
    if (options.strict) {
      throw new Error(`${label} is required`);
    }
    return zeroAddress;
  }

  if (!isAddress(raw)) {
    throw new Error(`${label} must be a valid EVM address`);
  }

  return getAddress(raw);
}
