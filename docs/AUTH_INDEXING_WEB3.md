# Auth, Indexing, And Web3 Client Architecture

WireFluid Fantasy Arena uses a split data model:

- The blockchain remains the source of truth for permissions, custody, lifecycle, scoring, rewards, and refunds.
- Ponder indexes public contract events into Postgres for fast dashboards, filters, audit logs, and user history.
- The web app uses wagmi + viem for wallet connection, contract reads, transaction simulation, and writes.

## Indexer

The indexer workspace is `apps/indexer`.

- Runtime: Ponder.
- Chain: WireFluid Testnet, chain ID `92533`.
- RPC: `WIREFLUID_RPC_URL`, defaulting to `https://evm.wirefluid.com`.
- Storage: Postgres through `DATABASE_URL`.
- API:
  - GraphQL: served by Ponder.
  - `GET /healthz`: liveness endpoint.
  - `GET /summary`: small dashboard summary endpoint.

The indexer consumes events from:

- `MatchRegistry`
- `FantasyTeamNFT`
- `LegacyPassport`
- `ScoreManager`
- `ContestManager`

Event handling rules:

- `MatchPlayersSet` is treated as a full replacement of a match player pool.
- `PlayerStatsRecorded` is the canonical raw-stat and player-point delta.
- `EntryScoreComputed` is the canonical finalized entry score.
- `ContestWinnerRecorded`, `RefundCredited`, and `TreasuryAccrued` credit indexed balances.
- `RewardClaimed`, `RefundClaimed`, and `TreasuryClaimed` debit indexed balances.
- Every handled event is also stored in `audit_events` with block number, log index, tx hash, contract address, timestamp, and serialized args.

## Authentication

Player-facing pages do not require login for public data. Wallet connection is enough for on-chain writes.

Admin routes use SIWE:

- `GET /api/auth/nonce`: creates a short-lived nonce in an HTTP-only signed cookie.
- `POST /api/auth/verify`: verifies the SIWE message, signature, domain, nonce, and chain ID `92533`.
- `POST /api/auth/logout`: clears the session cookie.
- `GET /api/auth/session`: returns the current signed session.
- `GET /api/admin/roles`: refreshes on-chain role checks for the signed-in wallet.

Admin authorization is based on on-chain roles:

- `DEFAULT_ADMIN_ROLE` on any arena contract.
- `OPERATOR_ROLE` on `MatchRegistry` or `ContestManager`.
- `SCORE_PUBLISHER_ROLE` on `ScoreManager`.
- Current `ContestManager.treasury()` address.

The backend session is only a convenience layer for protected APIs. The contracts still enforce every privileged write.

## Web3 Client

The web workspace is `apps/web`.

- Wallet and transaction stack: wagmi + viem.
- Wallet UI: RainbowKit.
- Query cache: TanStack Query.
- Shared contract config: `packages/contracts`.

Frontend reads should prefer:

- Ponder GraphQL/API for lists, dashboards, audit logs, and history.
- Direct wagmi/viem contract reads for volatile pre-write checks such as role status, lock state, claimable balances, and transaction previews.

No ethers dependency is used.

## Local Commands

Install dependencies:

```sh
pnpm install
```

Run the indexer:

```sh
pnpm dev:indexer
```

Run the web app:

```sh
pnpm dev:web
```

Typecheck all TypeScript workspaces:

```sh
pnpm typecheck
```
