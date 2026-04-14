# WireFluid Fantasy Arena Contract Architecture

This document describes the blockchain architecture for the WireFluid Fantasy Arena MVP. It is written as a technical reference for contract developers, frontend integrators, deployment operators, and reviewers.

## System Summary

WireFluid Fantasy Arena is a fantasy cricket contest system built around five deployed contracts:

- `MatchRegistry`: source of truth for match metadata, player pools, lock times, and match lifecycle.
- `FantasyTeamNFT`: ERC-721 squad ownership contract. One NFT represents one submitted contest entry.
- `LegacyPassport`: soulbound ERC-721 user passport. One token represents one wallet identity and records lightweight participation stats.
- `ScoreManager`: authorized raw-stat ingestion and on-chain fantasy point calculation.
- `ContestManager`: native WIRE custody, contest entry, NFT minting, ranking, rewards, refunds, and treasury accounting.

The system intentionally keeps draft squads off-chain. A squad becomes on-chain only when a user joins a contest and pays the native WIRE entry fee.

## Source Layout

```text
src/
  MatchRegistry.sol
  FantasyTeamNFT.sol
  LegacyPassport.sol
  ScoreManager.sol
  ContestManager.sol
  interfaces/
    IMatchRegistry.sol
    IFantasyTeamNFT.sol
    ILegacyPassport.sol
    IScoreManager.sol
    IContestManager.sol
  types/
    Structs.sol
  errors/
    Errors.sol
  events/
    Events.sol
  lib/
    ScoringRules.sol

script/
  Deploy.s.sol
  GrantRoles.s.sol
  SeedDemoData.s.sol

test/
  FantasyArenaTestBase.sol
  MatchRegistry.t.sol
  FantasyTeamNFT.t.sol
  LegacyPassport.t.sol
  ScoreManager.t.sol
  ContestManager.t.sol
  Integration.t.sol
```

## Dependency Graph

```text
                +-----------------+
                |  MatchRegistry  |
                +--------+--------+
                         ^
                         |
        +----------------+----------------+
        |                                 |
+-------+---------+             +---------+------+
| FantasyTeamNFT  |             |  ScoreManager  |
+-------+---------+             +---------+------+
        ^                                 ^
        |                                 |
        +---------------+-----------------+
                        |
              +---------+--------+           +----------------+
              |  ContestManager  +---------->| LegacyPassport |
              +------------------+           +----------------+
```

Dependency direction:

- `FantasyTeamNFT` reads `MatchRegistry` for player and lock validation.
- `ScoreManager` reads `MatchRegistry` for player validation and updates match status after stats submission.
- `ContestManager` reads all three core contracts and updates match status after finalization or cancellation.
- `ContestManager` mints and records lightweight user stats in `LegacyPassport`.
- `MatchRegistry` does not depend on any other arena contract.

## Core Constants

Defined in `src/types/Structs.sol`:

- `SQUAD_SIZE = 11`
- `MAX_PLAYERS_PER_MATCH = 32`
- `MAX_ENTRIES_PER_CONTEST = 25`
- `MAX_ENTRIES_PER_WALLET = 3`
- `MIN_ENTRIES_TO_FINALIZE = 3`
- `HOME_TEAM_SIDE = 1`
- `AWAY_TEAM_SIDE = 2`

These constants keep loops bounded and make the MVP gas profile predictable.

## Match Lifecycle

Match status is represented by `MatchStatus`:

```text
Scheduled -> Locked -> StatsSubmitted -> Finalized
     |             |             |
     +-------------+-------------+-> Cancelled
```

Important behavior:

- Locking is time-driven. A match is treated as locked once `block.timestamp >= lockTime`, even if status is still `Scheduled`.
- Any status other than `Scheduled` also makes the match locked for squad creation/editing.
- Stats submission moves the match to `StatsSubmitted`.
- Contest finalization moves the match to `Finalized`.
- Contest cancellation moves the match to `Cancelled`.

## End-To-End Flow

1. Deploy `MatchRegistry`.
2. Deploy `FantasyTeamNFT` with `MatchRegistry`.
3. Deploy `ScoreManager` with `MatchRegistry`.
4. Deploy `LegacyPassport`.
5. Deploy `ContestManager` with all four dependencies.
6. Grant `FantasyTeamNFT.MINTER_ROLE` to `ContestManager`.
7. Grant `LegacyPassport.MINTER_ROLE` and `LegacyPassport.RECORDER_ROLE` to `ContestManager`.
8. Grant `MatchRegistry.STATUS_UPDATER_ROLE` to `ScoreManager` and `ContestManager`.
9. Grant `ScoreManager.SCORE_PUBLISHER_ROLE` to the authorized stats publisher.
10. Operator creates a match and seeds the player pool.
11. Operator creates one contest for the match.
12. Users join the contest with a valid 11-player squad and native WIRE entry fee.
13. `ContestManager` auto-mints a `LegacyPassport` if the user does not have one.
14. `ContestManager` mints a new squad NFT for each entry and records the passport entry stat.
15. Users may edit their squad NFTs until match lock.
16. Score publisher submits raw stats after the match.
17. `ScoreManager` computes and stores signed player points.
18. Operator finalizes the contest.
19. `ContestManager` computes scores, ranks top 3, stores rewards, records winner stats, accrues treasury fee, and finalizes the match.
20. Winners claim rewards through pull payments and have claimed reward totals recorded in their passport.
21. Treasury claims platform fees through a pull payment.

## Contract Breakdown

### MatchRegistry

File: `src/MatchRegistry.sol`

Primary responsibility:

- Maintain match metadata and player eligibility data.

Roles:

- `DEFAULT_ADMIN_ROLE`: role administration.
- `OPERATOR_ROLE`: create matches, set players, and manually update status.
- `STATUS_UPDATER_ROLE`: narrow role for lifecycle updates by dependent contracts.

Key storage:

- `_matches[matchId]`: match timing, teams, status, existence.
- `_matchPlayers[matchId][playerId]`: role/team metadata and eligibility.
- `_matchPlayerIds[matchId]`: enumerable player list for frontend reads.

Key functions:

- `createMatch`: creates future matches with start and lock times.
- `setMatchPlayers`: replaces a match player pool before lock.
- `updateMatchStatus`: applies controlled lifecycle transitions.
- `isLocked`: checks time-driven and status-driven lock state.
- `isPlayerAllowed`: validates player eligibility for a match.
- `getPlayerMeta`, `getMatch`, `getMatchPlayerIds`: frontend and integration reads.

Important invariants:

- Match IDs cannot be reused.
- Player pools cannot be updated after lock.
- Player pools are capped by `MAX_PLAYERS_PER_MATCH`.
- Player IDs must be non-zero and unique.
- Player roles and team sides must be valid enum/constant values.

### FantasyTeamNFT

File: `src/FantasyTeamNFT.sol`

Primary responsibility:

- Represent submitted squads as ERC-721 NFTs.

Roles:

- `DEFAULT_ADMIN_ROLE`: base URI and role administration.
- `MINTER_ROLE`: mint official submitted squad NFTs. This role is granted to `ContestManager`.

Key storage:

- `nextTokenId`: sequential NFT ID counter.
- `_squads[tokenId]`: official on-chain squad state.
- `_baseTokenUri`: optional metadata base URI.

Key functions:

- `mintSquad`: mints one submitted squad NFT during contest join.
- `updateSquad`: lets the token owner edit the squad before lock.
- `getSquad`: returns official squad data.
- `squadMatchId`: returns the match for a squad NFT.
- `isSquadLocked`: checks match lock state.
- `isTransferLocked`: checks whether the NFT can transfer.
- `tokenURI`: returns `baseURI + tokenId`.

Squad validation:

- Exactly 11 players through `uint16[11]`.
- No duplicate player IDs.
- Captain and vice-captain must both be in the squad.
- Captain and vice-captain cannot be the same player.
- Every player must be allowed in `MatchRegistry`.
- Role composition:
  - WK: 1 to 4
  - BAT: 3 to 6
  - AR: 1 to 4
  - BOWL: 3 to 6
- Maximum 7 players from one real team side.

Transfer policy:

- Minting is allowed.
- Transfers are blocked while the match is active.
- Transfers become available after match finalization or cancellation.
- Payout rights remain with the original contest entry user, not the later NFT holder.

### LegacyPassport

File: `src/LegacyPassport.sol`

Primary responsibility:

- Represent a user's arena identity and lightweight participation history as a soulbound ERC-721.

Roles:

- `DEFAULT_ADMIN_ROLE`: base URI and role administration.
- `MINTER_ROLE`: mint passports. This role is granted to `ContestManager`.
- `RECORDER_ROLE`: update entry, win, and reward stats. This role is granted to `ContestManager`.

Key storage:

- `nextTokenId`: sequential passport ID counter.
- `_passportOf[user]`: one-per-wallet passport lookup.
- `_statsByTokenId[tokenId]`: participation stats for a passport.
- `_baseTokenUri`: optional metadata base URI.

Key functions:

- `mintPassport`: role-gated explicit mint that reverts if the user already has a passport.
- `mintIfNeeded`: role-gated helper used by `ContestManager` to auto-mint on first join.
- `recordEntry`: increments contest entry count and activity timestamps.
- `recordWin`: increments winning-entry count.
- `recordRewardClaim`: accumulates claimed reward totals.
- `hasPassport`, `passportOf`, `getStats`: frontend reads.
- `tokenURI`: returns `baseURI + tokenId`.

Soulbound policy:

- Transfers are permanently blocked after mint.
- Approvals and operator approvals revert.
- The contract does not expose burn functionality.

Stats policy:

- `contestsEntered` increments once per contest entry NFT minted.
- `contestsWon` increments once per winning entry, so one wallet can record multiple wins in the same contest if multiple entries place in the top 3.
- `totalRewardsClaimed` increments only when a user successfully claims rewards.
- `firstJoinedAt` is set on the first recorded entry.
- `lastActiveAt` updates on entry, win, and reward claim records.

### ScoreManager

File: `src/ScoreManager.sol`

Primary responsibility:

- Accept raw cricket stats and compute fantasy points on-chain.

Roles:

- `DEFAULT_ADMIN_ROLE`: role administration.
- `SCORE_PUBLISHER_ROLE`: authorized raw-stat publisher.

Key storage:

- `_rawStatsByMatch[matchId][playerId]`: submitted raw stats.
- `_playerPointsByMatch[matchId][playerId]`: signed computed player points.
- `_statsSubmitted[matchId]`: one-time submission guard.

Key functions:

- `submitMatchStats`: validates players, stores stats, computes points, and moves match to `StatsSubmitted`.
- `getPlayerPoints`: returns signed player points.
- `getPlayerStats`: returns raw stats.
- `hasStats`: returns whether a match has submitted stats.

Scoring:

Implemented in `src/lib/ScoringRules.sol`.

- `+1` per run
- `+1` per four
- `+2` per six
- `+25` per wicket
- `+12` per maiden
- `+8` per catch
- `+12` per stumping
- `+12` per direct run-out
- `+6` per indirect run-out
- `-2` for duck
- `+4` for starting XI
- `+2` for substitute appearance

Scores are signed `int32`, so negative scores are valid.

### ContestManager

File: `src/ContestManager.sol`

Primary responsibility:

- Custody entry fees, mint squad NFTs, update legacy passports, rank entries, and manage reward/refund/treasury claims.

Roles:

- `DEFAULT_ADMIN_ROLE`: treasury configuration and role administration.
- `OPERATOR_ROLE`: create, finalize, and cancel contests.

Key storage:

- `_contests[contestId]`: contest configuration and state.
- `_contestEntries[contestId]`: bounded contest entries.
- `contestIdByMatch[matchId]`: one-contest-per-match guard.
- `entriesByWallet[contestId][user]`: per-wallet entry cap.
- `tokenEntered[contestId][tokenId]`: entry tracking.
- `claimableRewards[user]`: winner pull-payment balances.
- `refundableEntries[user]`: cancellation refund balances.
- `treasuryClaimable`: accrued platform fees.
- `_winnerIndexes[contestId]`: top 3 entry indexes.
- `_winnerRewards[contestId]`: top 3 reward amounts.
- `legacyPassport`: passport contract used for auto-minting and stat recording.

Key functions:

- `createContest`: creates one contest for a match.
- `joinContest`: accepts native WIRE, auto-mints a passport if needed, mints a squad NFT, records entry stats, and stores an entry.
- `finalizeContest`: computes team scores, ranks top 3, accrues rewards and treasury fee, and records winner stats.
- `cancelContest`: cancels before finalization and credits pull refunds.
- `claimReward`: winner pull claim and reward-claimed stat record.
- `claimRefund`: entrant refund pull claim.
- `claimTreasury`: treasury pull claim.
- `previewSquadScore`: computes current squad score from stored player points.
- `getContest`, `getEntry`, `getEntryCount`, `getContestEntries`, `getWinners`: frontend reads.

Join constraints:

- Contest must exist.
- Contest must not be finalized or cancelled.
- `msg.value` must equal `entryFee`.
- Contest must not be full.
- Wallet must not exceed the per-contest entry limit.
- Match must not be locked.
- Squad must pass `FantasyTeamNFT` validation.
- User receives a `LegacyPassport` automatically if they do not already have one.

Finalization constraints:

- Contest must exist.
- Contest must not be finalized or cancelled.
- Stats must be submitted.
- At least 3 entries must exist.
- Loop is bounded by `MAX_ENTRIES_PER_CONTEST`.

Ranking:

- No full array sort.
- One bounded pass tracks top 3 entries.
- Higher score wins.
- Tie-breaker 1: earlier `joinedAt`.
- Tie-breaker 2: lower `tokenId`.

Squad score formula:

```text
baseTotal = sum(points for all 11 players)
captainBonus = captainBase
viceCaptainBonus = viceCaptainBase / 2
finalScore = baseTotal + captainBonus + viceCaptainBonus
```

This gives:

- Captain: 2x total contribution.
- Vice-captain: 1.5x total contribution using integer division.

Payout model:

```text
pool = entryFee * totalEntries
prizePool = 90% of pool
treasuryFee = pool - prizePool

1st = 50% of prizePool
2nd = 30% of prizePool
3rd = remaining prizePool
```

All payments are pull-based:

- Finalization does not send native WIRE.
- Cancellation does not send native WIRE.
- Claim functions zero balances before transfer.
- Native transfers use low-level `call`.
- `claimReward`, `claimRefund`, and `claimTreasury` are `nonReentrant`.

## Roles Matrix

| Role | Contract | Intended holder | Purpose |
| --- | --- | --- | --- |
| `DEFAULT_ADMIN_ROLE` | All AccessControl contracts | deployer/admin multisig | Manage roles and admin settings |
| `OPERATOR_ROLE` | `MatchRegistry` | operator/admin | Create matches, set players, update status |
| `STATUS_UPDATER_ROLE` | `MatchRegistry` | `ScoreManager`, `ContestManager` | Controlled lifecycle updates |
| `MINTER_ROLE` | `FantasyTeamNFT` | `ContestManager` | Mint squad NFTs on join |
| `MINTER_ROLE` | `LegacyPassport` | `ContestManager` | Auto-mint passports on first contest join |
| `RECORDER_ROLE` | `LegacyPassport` | `ContestManager` | Record entries, wins, and claimed rewards |
| `SCORE_PUBLISHER_ROLE` | `ScoreManager` | authorized stats publisher | Submit raw player stats |
| `OPERATOR_ROLE` | `ContestManager` | operator/admin | Create, finalize, cancel contests |

## Trust Model

Trusted actors:

- Admin controls roles and treasury configuration.
- Operator controls match and contest lifecycle.
- Score publisher submits real-world raw stats.

Trust-minimized areas:

- Users custody squad NFTs.
- Users receive one non-transferable passport per wallet.
- Entry fees remain in `ContestManager`.
- Winner rewards, refunds, and treasury fees are claimable through pull payments.
- Scoring formula is on-chain and deterministic.
- Ranking and tie-breakers are deterministic.

## Frontend Integration Map

Read from `MatchRegistry`:

- Match timing and status: `getMatch`.
- Lock state: `isLocked`.
- Player pool: `getMatchPlayerIds`.
- Player metadata: `getPlayerMeta`.

Write through `ContestManager`:

- Join contest: `joinContest`.
- Claims: `claimReward`, `claimRefund`.

Read from `FantasyTeamNFT`:

- Squad details: `getSquad`.
- Editable state: `isSquadLocked`.
- Transfer state: `isTransferLocked`.
- Metadata URI: `tokenURI`.

Read from `LegacyPassport`:

- Passport existence: `hasPassport`.
- Passport token ID: `passportOf`.
- Participation stats: `getStats`.
- Metadata URI: `tokenURI`.

Read from `ScoreManager`:

- Player points: `getPlayerPoints`.
- Raw stats: `getPlayerStats`.
- Stats availability: `hasStats`.

Read from `ContestManager`:

- Contest metadata: `getContest`.
- Entries: `getEntry`, `getEntryCount`, `getContestEntries`.
- Score preview: `previewSquadScore`.
- Winners and reward amounts: `getWinners`.
- User balances: `getClaimableReward`, `getRefundableEntryAmount`.

Index events from `src/events/Events.sol` for realtime UI state:

- `MatchCreated`
- `MatchPlayersSet`
- `MatchStatusUpdated`
- `SquadMinted`
- `SquadUpdated`
- `LegacyPassportMinted`
- `LegacyEntryRecorded`
- `LegacyWinRecorded`
- `LegacyRewardRecorded`
- `LegacyPassportBaseURIUpdated`
- `MatchStatsSubmitted`
- `PlayerPointsComputed`
- `ContestCreated`
- `ContestJoined`
- `ContestFinalized`
- `ContestCancelled`
- `RewardClaimed`
- `RefundClaimed`
- `TreasuryUpdated`
- `TreasuryClaimed`

## Deployment Scripts

`script/Deploy.s.sol`:

- Deploys all five contracts.
- Grants `MINTER_ROLE` to `ContestManager`.
- Grants `LegacyPassport.MINTER_ROLE` and `LegacyPassport.RECORDER_ROLE` to `ContestManager`.
- Grants `STATUS_UPDATER_ROLE` to `ScoreManager` and `ContestManager`.
- Grants `SCORE_PUBLISHER_ROLE` to deployer for initial setup.

`script/GrantRoles.s.sol`:

- Re-applies or updates operational roles from environment variables.
- Sets treasury address.

`script/SeedDemoData.s.sol`:

- Creates a demo match.
- Seeds a 22-player pool.
- Creates one demo contest.

## Security Controls

Implemented controls:

- OpenZeppelin `AccessControl` for privileged operations.
- OpenZeppelin `ReentrancyGuard` on native WIRE claim paths and contest joins.
- Custom errors instead of revert strings.
- Bounded loops for player pools, squads, entries, and ranking.
- Pull-based native transfers.
- State updates before native transfers.
- Soulbound legacy passports.
- One-time stat submission per match.
- One contest per match.
- Time-driven match lock.
- NFT transfer lock while match is active.
- Deterministic top-three ranking.

Recommended hardening before mainnet-style deployment:

- Run Slither and review findings.
- Add invariant tests for native WIRE accounting.
- Add fuzz tests around ranking ties and signed scoring.
- Perform manual security review of role setup and payout accounting.
- Run a full WireFluid Testnet dress rehearsal with multiple wallets.

## Test Coverage

The current Forge suite covers:

- Match creation, duplicate match prevention, player pool validation, lock behavior, and status transitions.
- Squad minting, duplicate player rejection, captain/vice-captain validation, role composition, team-side cap, owner-only updates, lock-time update rejection, and transfer lock behavior.
- Passport minting, duplicate passport rejection, soulbound transfer/approval rejection, first-join auto-minting, entry stat recording, winner stat recording, and reward claim stat recording.
- Score publisher authorization, invalid player rejection, signed point calculation, duplicate stat rejection, length mismatch, and one-time stat submission.
- Contest creation, one-contest-per-match guard, join flow, wrong fee rejection, full contest rejection, wallet entry limits, lock-time join rejection, stats-before-finalize guard, minimum entry guard, ranking, tie-breakers, rewards, treasury claims, cancellation refunds, and double-claim prevention.
- Full integration lifecycle from match setup through claims.

Current verification target:

```text
forge build
forge test -vvv
```

Expected test result:

```text
47 tests passed, 0 failed
```
