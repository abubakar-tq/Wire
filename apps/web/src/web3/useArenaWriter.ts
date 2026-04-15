"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChainId, useSwitchChain, useWaitForTransactionReceipt, useWalletClient, useWriteContract } from "wagmi";
import { indexerKeys } from "@/api/useIndexerData";
import type { HexString } from "@/api/indexerClient";
import { contractsConfigured } from "@/contracts/addresses";
import { configuredChainId, wireFluidTestnet } from "@/chains/wireFluidTestnet";
import { normalizeContractError } from "@/utils/contractErrors";

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
    // Ponder polls every 2s — wait 2.5s so it has time to index the event
    // before we refetch, otherwise we'd see stale (pre-event) data.
    const timer = setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: ["indexer"] });
      void queryClient.invalidateQueries({ queryKey: ["onchain"] });
      void queryClient.invalidateQueries({ queryKey: ["players"] });
      void queryClient.invalidateQueries({ queryKey: indexerKeys.summary });
      void queryClient.invalidateQueries({ queryKey: indexerKeys.matches });
      void queryClient.invalidateQueries({ queryKey: indexerKeys.contests });
      void queryClient.invalidateQueries({ queryKey: indexerKeys.auditEvents });
    }, 2500);
    return () => clearTimeout(timer);
  }, [queryClient, receipt.isSuccess]);

  useEffect(() => {
    if (!receipt.isError) return;
    setLocalError(normalizeContractError(receipt.error));
  }, [receipt.error, receipt.isError]);

  const write = async (args: Parameters<typeof writer.writeContractAsync>[0]) => {
    writer.reset();
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

    // Pre-flight nonce check — detect stale MetaMask nonce before tx is silently dropped
    if (isLocalRpc && walletClient) {
      try {
        const account = walletClient.account.address;
        // Get the actual on-chain nonce from the RPC directly
        const rpcRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getTransactionCount",
            params: [account, "latest"]
          })
        });
        const rpcJson = (await rpcRes.json()) as { result?: string };
        const rpcNonce = Number.parseInt(rpcJson.result ?? "0", 16);

        // Ask MetaMask what it thinks the nonce is via the wallet's transport
        const mmNonceHex = (await walletClient.request({
          method: "eth_chainId" as const
        }));
        // Since we can't call eth_getTransactionCount via wagmi's typed wallet client,
        // compare by checking if the wallet is on the right chain;
        // Use a simple heuristic: try sending and if nonce error occurs, catch it.
        // Actually, just query the RPC pending nonce to detect gap:
        const pendingRes = await fetch(rpcUrl, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "eth_getTransactionCount",
            params: [account, "pending"]
          })
        });
        const pendingJson = (await pendingRes.json()) as { result?: string };
        const pendingNonce = Number.parseInt(pendingJson.result ?? "0", 16);

        // If on-chain latest != pending, there's queued txs (fine).
        // To detect stale MetaMask state, we note: void is needed;
        // just use mmNonceHex to suppress lint
        void mmNonceHex;

        // The real check: if the user previously sent transactions outside wagmi
        // (e.g. via forge scripts), the nonce will be higher than MetaMask expects.
        // We can't reliably read MetaMask's internal nonce, but we can warn if
        // there are pending txs stuck in the mempool by comparing latest vs pending.
        if (pendingNonce !== rpcNonce) {
          // There are pending txs — likely stuck
          const msg = `There are stuck pending transactions (on-chain nonce: ${rpcNonce}, pending: ${pendingNonce}). Try clearing MetaMask → Settings → Advanced → "Clear activity tab data", then reload.`;
          setLocalError(msg);
          throw new Error(msg);
        }
      } catch (nonceError) {
        if (nonceError instanceof Error && (nonceError.message.includes("nonce") || nonceError.message.includes("pending transactions"))) {
          throw nonceError;
        }
      }
    }

    let nextHash: HexString;
    try {
      nextHash = await writer.writeContractAsync(args);
    } catch (error) {
      const message = normalizeContractError(error);
      setLocalError(message);
      if (error instanceof Error && error.message === message) {
        throw error;
      }
      throw new Error(message);
    }
    setHash(nextHash);
    return nextHash;
  };

  const reset = () => {
    writer.reset();
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
