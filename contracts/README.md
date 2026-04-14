# WireFluid Fantasy Arena

Smart-contract core for a fantasy cricket dApp on WireFluid Testnet. The MVP uses Foundry, native WIRE entry fees, on-chain submitted squad NFTs, soulbound user passports, raw-stat scoring, bounded contest finalization, pull-based rewards, pull-based refunds, and treasury fee accounting.

## Architecture

- `MatchRegistry`: match setup, lock/start times, player pool metadata, and lifecycle state.
- `FantasyTeamNFT`: one ERC-721 squad NFT per submitted contest entry. Squads can be edited before lock and NFTs are transfer-locked until finalization or cancellation.
- `LegacyPassport`: one-per-wallet soulbound ERC-721 passport auto-minted on first contest join and updated with entry, win, and reward stats.
- `ScoreManager`: authorized raw stat ingestion and signed on-chain fantasy point calculation.
- `ContestManager`: native WIRE contest entry, NFT mint-on-join, top-three ranking, rewards, refunds, and treasury claims.

Shared code is grouped by purpose:

- `src/interfaces/`: external contract interfaces.
- `src/types/`: shared structs, enums, and constants.
- `src/errors/`: custom errors.
- `src/events/`: shared event declarations.
- `src/lib/`: reusable libraries such as `ScoringRules`.

For a complete contract-level architecture breakdown, see `docs/ARCHITECTURE.md`.

## Network

- Network: WireFluid Testnet
- Chain ID: `92533`
- Currency: `WIRE`
- RPC: `https://evm.wirefluid.com`
- Explorer: WireScan

## Setup

Install Foundry:

```sh
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Install dependencies:

```sh
forge install foundry-rs/forge-std --no-git --shallow
forge install OpenZeppelin/openzeppelin-contracts --no-git --shallow
```

Create a local `.env`:

```sh
cp .env.example .env
```

Fill:

```sh
PRIVATE_KEY=0x...
WIREFLUID_RPC_URL=https://evm.wirefluid.com
OPERATOR_ADDRESS=0x...
SCORE_PUBLISHER=0x...
TREASURY_ADDRESS=0x...
```

Load it before running scripts:

```sh
source .env
```

## Build And Test

```sh
forge build
forge test -vvv
```

## Deploy

Deploy all five contracts and grant the minimal cross-contract roles:

```sh
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $WIREFLUID_RPC_URL \
  --broadcast
```

Save the printed addresses into `.env`:

```sh
MATCH_REGISTRY=0x...
FANTASY_TEAM_NFT=0x...
SCORE_MANAGER=0x...
LEGACY_PASSPORT=0x...
CONTEST_MANAGER=0x...
```

Grant or update operational roles:

```sh
forge script script/GrantRoles.s.sol:GrantRolesScript \
  --rpc-url $WIREFLUID_RPC_URL \
  --broadcast
```

Seed one demo match, player pool, and contest:

```sh
forge script script/SeedDemoData.s.sol:SeedDemoDataScript \
  --rpc-url $WIREFLUID_RPC_URL \
  --broadcast
```

## Verification

If WireScan exposes an Etherscan-compatible verifier, set `ETHERSCAN_API_KEY` and pass the verifier flags supported by the explorer:

```sh
forge verify-contract \
  --chain-id 92533 \
  --watch \
  <CONTRACT_ADDRESS> \
  src/MatchRegistry.sol:MatchRegistry
```

Repeat for `FantasyTeamNFT`, `LegacyPassport`, `ScoreManager`, and `ContestManager`, including constructor args where required.

## Useful Cast Reads

Read match data:

```sh
cast call $MATCH_REGISTRY "getMatch(uint256)((uint64,uint64,uint8,bytes32,bytes32,bool))" 2026041301 \
  --rpc-url $WIREFLUID_RPC_URL
```

Read player IDs:

```sh
cast call $MATCH_REGISTRY "getMatchPlayerIds(uint256)(uint16[])" 2026041301 \
  --rpc-url $WIREFLUID_RPC_URL
```

Read a squad:

```sh
cast call $FANTASY_TEAM_NFT "getSquad(uint256)((uint256,uint16[11],uint16,uint16,bool))" 1 \
  --rpc-url $WIREFLUID_RPC_URL
```

Read a legacy passport:

```sh
cast call $LEGACY_PASSPORT "passportOf(address)(uint256)" <USER_ADDRESS> \
  --rpc-url $WIREFLUID_RPC_URL
```

Read legacy stats:

```sh
cast call $LEGACY_PASSPORT "getStats(address)((uint32,uint32,uint256,uint64,uint64))" <USER_ADDRESS> \
  --rpc-url $WIREFLUID_RPC_URL
```

Preview a squad score:

```sh
cast call $CONTEST_MANAGER "previewSquadScore(uint256,uint256)(int32)" 2026041301 1 \
  --rpc-url $WIREFLUID_RPC_URL
```

Read contest winners:

```sh
cast call $CONTEST_MANAGER "getWinners(uint256)(uint16[3],uint256[3])" 202604130100 \
  --rpc-url $WIREFLUID_RPC_URL
```

## Role Notes

- `MatchRegistry.OPERATOR_ROLE`: creates matches, updates player pools, and can manually move status.
- `MatchRegistry.STATUS_UPDATER_ROLE`: granted to `ScoreManager` and `ContestManager` for lifecycle updates.
- `FantasyTeamNFT.MINTER_ROLE`: granted to `ContestManager`.
- `LegacyPassport.MINTER_ROLE`: granted to `ContestManager` for first-join passport minting.
- `LegacyPassport.RECORDER_ROLE`: granted to `ContestManager` for entry, win, and reward stat updates.
- `ScoreManager.SCORE_PUBLISHER_ROLE`: granted to the authorized stat publisher.
- `ContestManager.OPERATOR_ROLE`: creates, finalizes, and cancels contests.
