"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { WIREFLUID_TESTNET_CHAIN_ID } from "@wirefluid/contracts";
import { contractsConfigured } from "@/contracts/addresses";
import { useRoleChecks } from "@/web3/useRoleChecks";

export default function HomePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const roles = useRoleChecks();
  const wrongChain = chainId !== WIREFLUID_TESTNET_CHAIN_ID;

  return (
    <main className="shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">WireFluid Fantasy Arena</p>
          <h1>Web3 client foundation</h1>
        </div>
        <ConnectButton />
      </section>

      <section className="statusGrid">
        <div className="panel">
          <h2>Network</h2>
          <p className={wrongChain ? "bad" : "good"}>
            {wrongChain ? "Switch to WireFluid Testnet" : "WireFluid Testnet connected"}
          </p>
          <p>Required chain ID: {WIREFLUID_TESTNET_CHAIN_ID}</p>
        </div>

        <div className="panel">
          <h2>Contracts</h2>
          <p className={contractsConfigured ? "good" : "warn"}>
            {contractsConfigured ? "Contract addresses configured" : "Add deployed contract addresses"}
          </p>
        </div>

        <div className="panel">
          <h2>Roles</h2>
          <p>Wallet: {address ?? "Not connected"}</p>
          <div className="chips">
            <span className={roles.admin ? "chip goodChip" : "chip"}>Admin</span>
            <span className={roles.operator ? "chip goodChip" : "chip"}>Operator</span>
            <span className={roles.scorePublisher ? "chip goodChip" : "chip"}>Score Publisher</span>
            <span className={roles.treasury ? "chip goodChip" : "chip"}>Treasury</span>
          </div>
        </div>
      </section>
    </main>
  );
}
