# WireFluid Local And Deployment Runbook

This project uses one contract deployment artifact as the source of truth:

- `packages/contracts/deployments/31337.json` for local Anvil.
- `packages/contracts/deployments/92533.json` for WireFluid Testnet.

The web app and indexer read these JSON files through `@wirefluid/contracts`. Environment contract addresses are now optional overrides, not the primary config path.

## Local Product Loop

Install dependencies from the repo root:

```bash
pnpm install
```

Start a local chain:

```bash
anvil --chain-id 31337
```

Use the default Anvil deployer for local development:

```text
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Create local env files from the examples:

```bash
cp .env.example .env
cp apps/indexer/.env.example apps/indexer/.env.local
cp apps/web/.env.example apps/web/.env.local
cp contracts/.env.example contracts/.env
```

Deploy contracts to Anvil:

```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

The deploy script writes:

```text
packages/contracts/deployments/31337.json
```

Seed demo data if you want a usable local UI immediately:

```bash
cd contracts
forge script script/SeedDemoData.s.sol:SeedDemoDataScript --rpc-url http://127.0.0.1:8545 --broadcast
```

Start Postgres for Ponder:

```bash
docker run --name wirefluid-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wirefluid_indexer postgres:16
```

If the container already exists:

```bash
docker start wirefluid-postgres
```

Start the indexer from the repo root:

```bash
pnpm dev:indexer
```

Start the web app from the repo root:

```bash
pnpm dev:web
```

Open:

```text
http://localhost:3000
```

## Switching To Admin

Use the default Anvil deployer wallet locally:

```text
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Chain ID: 31337
RPC: http://127.0.0.1:8545
Currency: WIRE
```

The deploy script grants the required local admin/operator/publisher roles to this wallet. After the web app loads:

1. Connect the wallet.
2. Switch the wallet network to chain `31337`.
3. Wait for role checks to finish.
4. Click `Admin` in the navbar.
5. Sign the admin verification message.
6. Use `Match` to create matches, set player pools, and create contests.
7. Use `Score` to submit stats.
8. Use `Treasury` to finalize/cancel contests and manage payouts.

If the Admin button does not appear, check that the wallet is the deployer wallet, Anvil is running, the contracts were deployed on chain `31337`, and the web app was restarted after env changes.

## Required Local Environment

`apps/indexer/.env.local`:

```env
WIREFLUID_CHAIN_ID=31337
WIREFLUID_RPC_URL=http://127.0.0.1:8545
DATABASE_URL=postgres://postgres:postgres@localhost:5432/wirefluid_indexer
PONDER_START_BLOCK=0
```

`apps/web/.env.local`:

```env
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=31337
NEXT_PUBLIC_WIREFLUID_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_INDEXER_URL=http://localhost:42069
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
AUTH_SESSION_SECRET=replace-with-at-least-32-random-bytes
```

Contract addresses can be left empty when `packages/contracts/deployments/31337.json` is current.

## WireFluid Testnet Deployment

Set production/testnet env values:

```env
WIREFLUID_CHAIN_ID=92533
WIREFLUID_RPC_URL=https://evm.wirefluid.com
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=92533
NEXT_PUBLIC_WIREFLUID_RPC_URL=https://evm.wirefluid.com
```

Deploy with a funded testnet deployer:

```bash
cd contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url https://evm.wirefluid.com --broadcast
```

Commit or safely publish the resulting `packages/contracts/deployments/92533.json` so the web app and indexer use the same addresses and ABIs.

For testnet indexer deployment:

- Use a managed Postgres database.
- Set `DATABASE_URL` server-side only.
- Set `PONDER_START_BLOCK` to the deployment block, not `0`.
- Keep RPC keys server-side for the indexer.
- Expose only public indexer APIs and SIWE-protected admin APIs.

## Verification

Run from the repo root:

```bash
pnpm --filter @wirefluid/contracts typecheck
pnpm --filter @wirefluid/indexer typecheck
pnpm --filter @wirefluid/web typecheck
```

Run contracts verification:

```bash
cd contracts
forge build
forge test -vvv
```
