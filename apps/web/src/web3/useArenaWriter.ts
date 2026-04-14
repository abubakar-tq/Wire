"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChainId, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WIREFLUID_TESTNET_CHAIN_ID } from "@wirefluid/contracts";
import { indexerKeys } from "@/api/useIndexerData";
import type { HexString } from "@/api/indexerClient";
import { contractsConfigured } from "@/contracts/addresses";

export function useArenaWriter() {
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<HexString | undefined>();
  const [localError, setLocalError] = useState<string | undefined>();
  const chainId = useChainId();
  const writer = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!receipt.isSuccess) return;
    void queryClient.invalidateQueries({ queryKey: indexerKeys.summary });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.matches });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.contests });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.auditEvents });
  }, [queryClient, receipt.isSuccess]);

  const write = async (args: Parameters<typeof writer.writeContractAsync>[0]) => {
    setLocalError(undefined);
    if (!contractsConfigured) {
      setLocalError("Contract addresses are not configured");
      throw new Error("Contract addresses are not configured");
    }
    if (chainId !== WIREFLUID_TESTNET_CHAIN_ID) {
      setLocalError("Switch to WireFluid Testnet");
      throw new Error("Switch to WireFluid Testnet");
    }
    const nextHash = await writer.writeContractAsync(args);
    setHash(nextHash);
    return nextHash;
  };

  return {
    write,
    hash,
    isSubmitting: writer.status === "pending" || receipt.status === "pending",
    isConfirmed: receipt.isSuccess,
    error: localError ?? writer.error?.message ?? receipt.error?.message
  };
}
