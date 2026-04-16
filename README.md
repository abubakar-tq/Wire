# WireFluid Arena

WireFluid Arena is an on-chain fantasy cricket app where a user builds a match-specific squad, joins a contest with a native WIRE entry fee, and receives an NFT representing their submitted squad. Rankings and payouts are derived from on-chain score submissions and contest finalization.

## What you do in the app

1. Pick a match and an open contest.
2. Build a valid 11-player squad (roles and team-sides are enforced by the contracts).
3. Select captain and vice-captain.
4. Join the contest (pays entry fee, mints your squad NFT, records your entry).
5. After stats are submitted and the contest is finalized, winners can claim rewards. If the contest is cancelled before lock, entrants can claim refunds.

## What is on-chain (high level)

- Contest creation, entries, and entry fees are managed by the `ContestManager` contract.
- Each entry mints a `FantasyTeamNFT` (squad NFT) and records lightweight stats in `LegacyPassport`.
- Match rosters and match timing (start/lock) are stored in `MatchRegistry`.
- Match stats are submitted by an authorized publisher to `ScoreManager`, then used to compute points and finalize contests.
- Refunds are pull-based (credited on cancel) and rewards are pull-based (credited on finalize).

For details and invariants, read:

- `contracts/docs/ARCHITECTURE.md`
- `contracts/docs/ADMIN_DESIGN.md`

## Repo layout

- `apps/web`: Next.js app (Vercel)
- `apps/indexer`: Ponder indexer + HTTP API (Render)
- `contracts`: Solidity contracts + forge scripts
- `packages/contracts`: shared ABI/address helpers used by web/indexer

## Production deploy (Vercel + Render)

### 1) Deploy the indexer to Render

Required env vars on Render (indexer service):

- `DATABASE_URL`: your Postgres/Neon URL
- `DATABASE_SCHEMA`: schema name for Ponder (example `ponder`)
- `WIREFLUID_CHAIN_ID`: chain id you index
- `WIREFLUID_RPC_URL`: RPC URL for that chain
- `PONDER_START_BLOCK`: starting block for indexing
- `CORS_ORIGIN`: comma-separated allowed browser origins
  - example: `https://wire-web-chi.vercel.app,http://localhost:3000`

After setting env vars, redeploy/restart the Render service so the new env is applied.

### 2) Deploy the web app to Vercel

Required env vars on Vercel (web project):

- `NEXT_PUBLIC_INDEXER_URL`: your Render base URL (example `https://<service>.onrender.com`)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project id
- `NEXT_PUBLIC_WIREFLUID_CHAIN_ID`: chain id your UI targets
- `NEXT_PUBLIC_WIREFLUID_RPC_URL`: RPC URL (used for chain metadata/add-network prompt)
- `NEXT_PUBLIC_MATCH_REGISTRY`, `NEXT_PUBLIC_CONTEST_MANAGER`, `NEXT_PUBLIC_SCORE_MANAGER`,
  `NEXT_PUBLIC_FANTASY_TEAM_NFT`, `NEXT_PUBLIC_LEGACY_PASSPORT`: deployed contract addresses for the chosen chain

Notes:

- If `NEXT_PUBLIC_INDEXER_URL` is missing in production, the UI will show a configuration error instead of silently falling back to localhost.
- The dashboard pings `/healthz` to warm the Render service and surface failures early (no wallet connect needed).

Operational notes:

- After changing Render env vars, restart/redeploy the Render service.
- After changing Vercel env vars, redeploy the Vercel project.

## Local dev

### Install

```bash
pnpm install
```

### Run indexer

```bash
pnpm --filter @wirefluid/indexer dev
```

### Run web

```bash
pnpm --filter @wirefluid/web dev
```

## Forking WireFluid testnet locally

The script `scripts/fork-testnet.sh` starts an Anvil fork, deploys fresh contracts, and updates env files.

Why this matters:

- Forking with the same chain id as the real network can cause wallets to silently switch back to the real RPC.
- Use a unique fork chain id and a unique localhost port so MetaMask can store it as a separate network.

Example:

```bash
bash scripts/fork-testnet.sh https://evm.wirefluid.com 8546 192533
```

Then add a MetaMask network:

- RPC: `http://127.0.0.1:8546`
- Chain ID: `192533`
- Symbol: `WIRE`

## Git sync

See `docs/PULL_SYNC.md` for the recommended `--ff-only` pull workflow (and how to handle dirty submodules).

## Runbook

See `docs/RUNBOOK.md` for the operator flow (deploy, seed, index, admin actions).
