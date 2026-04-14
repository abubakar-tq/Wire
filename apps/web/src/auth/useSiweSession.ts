"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiweMessage } from "siwe";
import { useAccount, useSignMessage } from "wagmi";
import { configuredChainId } from "@/chains/wireFluidTestnet";
import type { AuthSession } from "@/server/auth/session";

type SessionResponse = {
  authenticated: boolean;
  session: AuthSession | null;
};

const sessionKey = ["auth", "session"] as const;

export function useSiweSession() {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const session = useQuery({
    queryKey: sessionKey,
    queryFn: fetchSession,
    staleTime: 30_000
  });

  const signIn = useMutation({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Connect a wallet before signing in");
      }

      const nonceResponse = await fetch("/api/auth/nonce", { cache: "no-store" });
      if (!nonceResponse.ok) {
        throw new Error("Unable to create SIWE nonce");
      }

      const { nonce } = (await nonceResponse.json()) as { nonce: string };
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to WireFluid Fantasy Arena admin.",
        uri: window.location.origin,
        version: "1",
        chainId: configuredChainId,
        nonce
      });

      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ message: preparedMessage });
      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          message: preparedMessage,
          signature
        })
      });

      if (!verifyResponse.ok) {
        const payload = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "SIWE verification failed");
      }

      return (await verifyResponse.json()) as SessionResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKey, data);
    }
  });

  const signOut = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return (await response.json()) as SessionResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(sessionKey, data);
    }
  });

  return {
    session: session.data?.session ?? null,
    authenticated: Boolean(session.data?.authenticated),
    isLoading: session.isLoading,
    signIn: signIn.mutateAsync,
    signInStatus: signIn.status,
    signOut: signOut.mutateAsync,
    signOutStatus: signOut.status
  };
}

async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch("/api/auth/session", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to load auth session");
  }
  return (await response.json()) as SessionResponse;
}
