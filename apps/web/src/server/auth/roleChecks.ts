import {
  accessControlAbi,
  contestManagerAbi,
  CONTEST_OPERATOR_ROLE,
  DEFAULT_ADMIN_ROLE,
  getContractAddresses,
  getWireFluidChain,
  MATCH_OPERATOR_ROLE,
  SCORE_PUBLISHER_ROLE,
  readWireFluidRpcUrl
} from "@wirefluid/contracts";
import { createPublicClient, http, isAddressEqual, type Address } from "viem";
import type { RoleSnapshot } from "./session";

const publicClient = createPublicClient({
  chain: getWireFluidChain(process.env),
  transport: http(readWireFluidRpcUrl(process.env))
});

export async function getRoleSnapshot(address: Address): Promise<RoleSnapshot> {
  const contracts = getContractAddresses(process.env, { strict: true });

  const [
    matchAdmin,
    contestAdmin,
    nftAdmin,
    passportAdmin,
    scoreAdmin,
    matchOperator,
    contestOperator,
    scorePublisher,
    treasury
  ] = await Promise.all([
    hasRole(contracts.matchRegistry, DEFAULT_ADMIN_ROLE, address),
    hasRole(contracts.contestManager, DEFAULT_ADMIN_ROLE, address),
    hasRole(contracts.fantasyTeamNft, DEFAULT_ADMIN_ROLE, address),
    hasRole(contracts.legacyPassport, DEFAULT_ADMIN_ROLE, address),
    hasRole(contracts.scoreManager, DEFAULT_ADMIN_ROLE, address),
    hasRole(contracts.matchRegistry, MATCH_OPERATOR_ROLE, address),
    hasRole(contracts.contestManager, CONTEST_OPERATOR_ROLE, address),
    hasRole(contracts.scoreManager, SCORE_PUBLISHER_ROLE, address),
    publicClient.readContract({
      address: contracts.contestManager,
      abi: contestManagerAbi,
      functionName: "treasury"
    })
  ]);

  return {
    admin: matchAdmin || contestAdmin || nftAdmin || passportAdmin || scoreAdmin,
    operator: matchOperator || contestOperator,
    scorePublisher,
    treasury: isAddressEqual(address, treasury),
    checkedAt: Date.now()
  };
}

function hasRole(contract: Address, role: `0x${string}`, account: Address): Promise<boolean> {
  return publicClient.readContract({
    address: contract,
    abi: accessControlAbi,
    functionName: "hasRole",
    args: [role, account]
  });
}
