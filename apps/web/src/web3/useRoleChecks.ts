"use client";

import { isAddressEqual } from "viem";
import { useAccount, useReadContract } from "wagmi";
import {
  accessControlAbi,
  CONTEST_OPERATOR_ROLE,
  contestManagerAbi,
  DEFAULT_ADMIN_ROLE,
  MATCH_OPERATOR_ROLE,
  SCORE_PUBLISHER_ROLE
} from "@wirefluid/contracts";
import { contractAddresses, contractsConfigured } from "@/contracts/addresses";

export type RoleChecks = {
  admin: boolean;
  operator: boolean;
  scorePublisher: boolean;
  treasury: boolean;
  ready: boolean;
};

export function useRoleChecks(): RoleChecks {
  const { address, isConnected } = useAccount();
  const readsEnabled = Boolean(isConnected && address && contractsConfigured);

  const matchAdmin = useRole(contractAddresses.matchRegistry, DEFAULT_ADMIN_ROLE, address, readsEnabled);
  const contestAdmin = useRole(contractAddresses.contestManager, DEFAULT_ADMIN_ROLE, address, readsEnabled);
  const matchOperator = useRole(contractAddresses.matchRegistry, MATCH_OPERATOR_ROLE, address, readsEnabled);
  const contestOperator = useRole(contractAddresses.contestManager, CONTEST_OPERATOR_ROLE, address, readsEnabled);
  const scorePublisherRead = useRole(
    contractAddresses.scoreManager,
    SCORE_PUBLISHER_ROLE,
    address,
    readsEnabled
  );

  const treasuryRead = useReadContract({
    address: contractAddresses.contestManager,
    abi: contestManagerAbi,
    functionName: "treasury",
    query: {
      enabled: readsEnabled
    }
  });

  const admin = Boolean(matchAdmin.data || contestAdmin.data);
  const operator = Boolean(matchOperator.data || contestOperator.data);
  const scorePublisher = Boolean(scorePublisherRead.data);
  const ready =
    matchAdmin.isSuccess &&
    contestAdmin.isSuccess &&
    matchOperator.isSuccess &&
    contestOperator.isSuccess &&
    scorePublisherRead.isSuccess &&
    treasuryRead.isSuccess;

  return {
    admin,
    operator,
    scorePublisher,
    treasury: Boolean(address && treasuryRead.data && isAddressEqual(address, treasuryRead.data)),
    ready
  };
}

function useRole(
  contract: `0x${string}`,
  role: `0x${string}`,
  account: `0x${string}` | undefined,
  enabled: boolean
) {
  return useReadContract({
    address: contract,
    abi: accessControlAbi,
    functionName: "hasRole",
    args: [role, account ?? "0x0000000000000000000000000000000000000000"],
    query: {
      enabled
    }
  });
}
