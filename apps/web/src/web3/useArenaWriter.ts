"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChainId, useSwitchChain, useWaitForTransactionReceipt, useWalletClient, useWriteContract } from "wagmi";
import { indexerKeys } from "@/api/useIndexerData";
import type { HexString } from "@/api/indexerClient";
import { contractsConfigured } from "@/contracts/addresses";
import { configuredChainId, wireFluidTestnet } from "@/chains/wireFluidTestnet";

export function useArenaWriter() {
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<HexString | undefined>();
  const [localError, setLocalError] = useState<string | undefined>();
  const [rpcChainId, setRpcChainId] = useState<number | undefined>();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const writer = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });
  const rpcUrl = wireFluidTestnet.rpcUrls.default.http[0] ?? "";
  const isLocalRpc = rpcUrl.includes("127.0.0.1") || rpcUrl.includes("localhost");
  const expectedChainId = rpcChainId ?? configuredChainId;
  const allowedChainIds = isLocalRpc
    ? Array.from(new Set([configuredChainId, expectedChainId, 31337, 1337]))
    : [expectedChainId];

  useEffect(() => {
    let cancelled = false;
    const probeRpcChain = async () => {
      try {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_chainId",
            params: []
          })
        });
        const json = (await response.json()) as { result?: string };
        if (cancelled || !json.result) return;
        const parsed = Number.parseInt(json.result, 16);
        if (Number.isInteger(parsed) && parsed > 0) {
          setRpcChainId(parsed);
        }
      } catch {
        // Keep configured chain id fallback when RPC probing fails.
      }
    };
    if (rpcUrl) {
      void probeRpcChain();
    }
    return () => {
      cancelled = true;
    };
  }, [rpcUrl]);

  useEffect(() => {
    if (!receipt.isSuccess) return;
    void queryClient.invalidateQueries({ queryKey: indexerKeys.summary });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.matches });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.contests });
    void queryClient.invalidateQueries({ queryKey: indexerKeys.auditEvents });
  }, [queryClient, receipt.isSuccess]);

  useEffect(() => {
    if (!receipt.isError) return;
    setLocalError(receipt.error?.message ?? "Transaction failed");
  }, [receipt.error?.message, receipt.isError]);

  const write = async (args: Parameters<typeof writer.writeContractAsync>[0]) => {
    setLocalError(undefined);
    // Clear stale pending hashes so a previous tx cannot lock the UI forever.
    if (hash) {
      setHash(undefined);
    }
    if (!contractsConfigured) {
      setLocalError("Contract addresses are not configured");
      throw new Error("Contract addresses are not configured");
    }
    if (!allowedChainIds.includes(chainId)) {
      try {
        await switchChainAsync({ chainId: expectedChainId });
      } catch {
        setLocalError(`Switch to chain ${expectedChainId}`);
        throw new Error(`Switch to chain ${expectedChainId}`);
      }
      setLocalError(`Switched to chain ${expectedChainId}. Retry the transaction.`);
      throw new Error(`Switched to chain ${expectedChainId}. Retry the transaction.`);
    }

    let signerChainId: number | null = null;
    if (walletClient) {
      const chainHex = await walletClient.request({ method: "eth_chainId" });
      signerChainId = Number.parseInt(chainHex, 16);
      if (!allowedChainIds.includes(signerChainId)) {
        try {
          await walletClient.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${expectedChainId.toString(16)}` }]
          });
        } catch {
          setLocalError(`Wallet signer is on chain ${signerChainId}. Switch to ${expectedChainId} and retry.`);
          throw new Error(`Wallet signer is on chain ${signerChainId}. Switch to ${expectedChainId} and retry.`);
        }
        setLocalError(`Switched signer to chain ${expectedChainId}. Retry the transaction.`);
        throw new Error(`Switched signer to chain ${expectedChainId}. Retry the transaction.`);
      }
    }
    const signerActiveChain = signerChainId ?? chainId;
    if (!allowedChainIds.includes(signerActiveChain)) {
      setLocalError(`Wallet signer is on unsupported chain ${signerActiveChain}.`);
      throw new Error(`Wallet signer is on unsupported chain ${signerActiveChain}.`);
    }
    const nextHash = await writer.writeContractAsync(args);
    setHash(nextHash);
    return nextHash;
  };

  const reset = () => {
    setHash(undefined);
    setLocalError(undefined);
  };

  const isSubmitting = writer.status === "pending";
  const isConfirming = Boolean(hash) && receipt.status === "pending";

  return {
    write,
    reset,
    hash,
    isSubmitting,
    isConfirming,
    isBusy: isSubmitting || isConfirming,
    isConfirmed: receipt.isSuccess,
    error: localError ?? writer.error?.message ?? receipt.error?.message,
    rpcChainId,
    expectedChainId,
    configuredChainId
  };
}
