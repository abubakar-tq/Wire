#!/usr/bin/env bash
# fork-testnet.sh — Fork the WireFluid testnet, deploy contracts, and update all env files.
# Usage: bash scripts/fork-testnet.sh [FORK_URL] [PORT]
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORK_URL="${1:-https://evm.wirefluid.com}"
PORT="${2:-8545}"
ANVIL_HOST="127.0.0.1"
RPC_URL="http://${ANVIL_HOST}:${PORT}"
FORK_CHAIN_ID=92533

# Anvil default key #0 – safe for local forks only
PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

CONTRACTS_DIR="$REPO_ROOT/contracts"
INDEXER_ENV="$REPO_ROOT/apps/indexer/.env.local"
WEB_ENV="$REPO_ROOT/apps/web/.env.local"
DEPLOYMENTS_DIR="$REPO_ROOT/packages/contracts/deployments"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  WireFluid — Fork Testnet & Deploy                   ║"
echo "║  Fork : $FORK_URL"
echo "║  RPC  : $RPC_URL  (chain $FORK_CHAIN_ID)            ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Phase 1: Kill any existing Anvil on that port ─────────────────────────────
if lsof -ti tcp:"$PORT" &>/dev/null; then
  echo "⚠  Port $PORT in use — killing existing process..."
  lsof -ti tcp:"$PORT" | xargs kill -9 || true
  sleep 1
fi

# ── Phase 2: Start Anvil fork with instant mining ─────────────────────────────
# NOTE: We use --block-time 0 (instant/on-demand mining) so forge broadcast
# gets immediate receipts. We can switch to timed mining after deploy.
echo "🔗 Starting Anvil fork of $FORK_URL on port $PORT..."
nohup anvil \
  --fork-url "$FORK_URL" \
  --chain-id "$FORK_CHAIN_ID" \
  --host "$ANVIL_HOST" \
  --port "$PORT" \
  >/tmp/anvil-fork.log 2>&1 &
ANVIL_PID=$!
echo "   Anvil PID: $ANVIL_PID (logs: /tmp/anvil-fork.log)"

# Disown it so it survives script exit
disown $ANVIL_PID

# Wait for Anvil to be ready
echo "   Waiting for Anvil to start..."
for i in $(seq 1 30); do
  if curl -sf -X POST "$RPC_URL" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
      | grep -q "result"; then
    echo "   ✓ Anvil is ready (attempt $i)"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "✗ Anvil failed to start. Check /tmp/anvil-fork.log:"
    tail -20 /tmp/anvil-fork.log
    exit 1
  fi
  sleep 1
done

# Verify chain ID
ACTUAL_CHAIN_HEX=$(curl -sf -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result'])" 2>/dev/null || echo "0x0")
ACTUAL_CHAIN_DEC=$(python3 -c "print(int('$ACTUAL_CHAIN_HEX', 16))" 2>/dev/null || printf "%d" "$ACTUAL_CHAIN_HEX" 2>/dev/null || echo "?")
echo "   ✓ Fork chain ID: $ACTUAL_CHAIN_DEC (expected $FORK_CHAIN_ID)"

FORK_BLOCK_HEX=$(curl -sf -X POST "$RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['result'])" 2>/dev/null || echo "0x0")
FORK_BLOCK_DEC=$(python3 -c "print(int('$FORK_BLOCK_HEX', 16))" 2>/dev/null || echo "0")
echo "   ✓ Fork block : $FORK_BLOCK_DEC"

# ── Phase 3: Deploy contracts ─────────────────────────────────────────────────
echo ""
echo "📦 Deploying contracts to fork..."

# Write contracts .env pointing at the fork with cleared contract addresses
cat > "$CONTRACTS_DIR/.env" <<EOF
PRIVATE_KEY=$PRIVATE_KEY
WIREFLUID_RPC_URL=$RPC_URL
WIREFLUID_CHAIN_ID=$FORK_CHAIN_ID

# Cleared so Deploy.s.sol creates fresh contracts
MATCH_REGISTRY=
FANTASY_TEAM_NFT=
SCORE_MANAGER=
LEGACY_PASSPORT=
CONTEST_MANAGER=

OPERATOR_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SCORE_PUBLISHER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
TREASURY_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

DEMO_MATCH_ID=2026041301
DEMO_CONTEST_ID=202604130100
DEMO_ENTRY_FEE=10000000000000000
DEMO_LOCK_OFFSET=86400
DEMO_START_OFFSET=172800

ETHERSCAN_API_KEY=
EOF

cd "$CONTRACTS_DIR"

echo "   Building contracts..."
forge build --quiet

echo "   Running Deploy.s.sol..."
forge script script/Deploy.s.sol \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --skip-simulation \
  --retries 1 2>&1

echo ""
echo "   Running GrantRoles.s.sol..."
forge script script/GrantRoles.s.sol \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --skip-simulation \
  --retries 1 2>&1

echo ""
echo "   Running SeedDemoData.s.sol..."
forge script script/SeedDemoData.s.sol \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --broadcast \
  --skip-simulation \
  --retries 1 2>&1

cd "$REPO_ROOT"

# ── Phase 4: Read deployed addresses from 92533.json ─────────────────────────
DEPLOY_JSON="$DEPLOYMENTS_DIR/${FORK_CHAIN_ID}.json"
if [ ! -f "$DEPLOY_JSON" ]; then
  echo "✗ Deployment JSON not found at $DEPLOY_JSON"
  exit 1
fi

echo ""
echo "📋 Reading deployed addresses from $DEPLOY_JSON..."

MATCH_REGISTRY=$(python3 -c "import json; d=json.load(open('$DEPLOY_JSON')); print(d['contracts']['matchRegistry'])")
FANTASY_TEAM_NFT=$(python3 -c "import json; d=json.load(open('$DEPLOY_JSON')); print(d['contracts']['fantasyTeamNft'])")
LEGACY_PASSPORT=$(python3 -c "import json; d=json.load(open('$DEPLOY_JSON')); print(d['contracts']['legacyPassport'])")
SCORE_MANAGER=$(python3 -c "import json; d=json.load(open('$DEPLOY_JSON')); print(d['contracts']['scoreManager'])")
CONTEST_MANAGER=$(python3 -c "import json; d=json.load(open('$DEPLOY_JSON')); print(d['contracts']['contestManager'])")

echo "   MatchRegistry  : $MATCH_REGISTRY"
echo "   FantasyTeamNFT : $FANTASY_TEAM_NFT"
echo "   LegacyPassport : $LEGACY_PASSPORT"
echo "   ScoreManager   : $SCORE_MANAGER"
echo "   ContestManager : $CONTEST_MANAGER"

# ── Phase 5: Update contracts/.env with deployed addresses ────────────────────
cat > "$CONTRACTS_DIR/.env" <<EOF
PRIVATE_KEY=$PRIVATE_KEY
WIREFLUID_RPC_URL=$RPC_URL
WIREFLUID_CHAIN_ID=$FORK_CHAIN_ID

MATCH_REGISTRY=$MATCH_REGISTRY
FANTASY_TEAM_NFT=$FANTASY_TEAM_NFT
SCORE_MANAGER=$SCORE_MANAGER
LEGACY_PASSPORT=$LEGACY_PASSPORT
CONTEST_MANAGER=$CONTEST_MANAGER

OPERATOR_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
SCORE_PUBLISHER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
TREASURY_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

DEMO_MATCH_ID=2026041301
DEMO_CONTEST_ID=202604130100
DEMO_ENTRY_FEE=10000000000000000
DEMO_LOCK_OFFSET=86400
DEMO_START_OFFSET=172800

ETHERSCAN_API_KEY=
EOF

# ── Phase 6: Update indexer .env.local ────────────────────────────────────────
echo ""
echo "📝 Updating indexer .env.local..."

EXISTING_DB_URL=""
if [ -f "$INDEXER_ENV" ]; then
  EXISTING_DB_URL=$(grep "^DATABASE_URL=" "$INDEXER_ENV" | head -1 | cut -d= -f2- || true)
fi
DB_URL="${EXISTING_DB_URL:-postgresql://neondb_owner:npg_zD98kxYMNGcX@ep-quiet-tree-anl4h0ak-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require}"

# Start indexer from the block AFTER our deploy so it only sees our events
START_BLOCK=$((FORK_BLOCK_DEC + 10))

cat > "$INDEXER_ENV" <<EOF
WIREFLUID_CHAIN_ID=$FORK_CHAIN_ID
WIREFLUID_RPC_URL=$RPC_URL
DATABASE_URL=$DB_URL
PONDER_START_BLOCK=$START_BLOCK

MATCH_REGISTRY=$MATCH_REGISTRY
FANTASY_TEAM_NFT=$FANTASY_TEAM_NFT
LEGACY_PASSPORT=$LEGACY_PASSPORT
SCORE_MANAGER=$SCORE_MANAGER
CONTEST_MANAGER=$CONTEST_MANAGER
EOF
echo "   ✓ $INDEXER_ENV  (start block: $START_BLOCK)"

# ── Phase 7: Update web .env.local ────────────────────────────────────────────
echo "📝 Updating web .env.local..."

EXISTING_AUTH=""
EXISTING_PLAYER_DB=""
EXISTING_DIRECT_DB=""
EXISTING_WC_PROJECT=""
if [ -f "$WEB_ENV" ]; then
  EXISTING_AUTH=$(grep "^AUTH_SESSION_SECRET=" "$WEB_ENV" | head -1 | cut -d= -f2- || true)
  EXISTING_PLAYER_DB=$(grep "^PLAYER_DATABASE_URL=" "$WEB_ENV" | head -1 | cut -d= -f2- || true)
  EXISTING_DIRECT_DB=$(grep "^DIRECT_URL=" "$WEB_ENV" | head -1 | cut -d= -f2- || true)
  EXISTING_WC_PROJECT=$(grep "^NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=" "$WEB_ENV" | head -1 | cut -d= -f2- || true)
fi

cat > "$WEB_ENV" <<EOF
NEXT_PUBLIC_WIREFLUID_CHAIN_ID=$FORK_CHAIN_ID
NEXT_PUBLIC_WIREFLUID_RPC_URL=$RPC_URL
NEXT_PUBLIC_INDEXER_URL=http://localhost:42069
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${EXISTING_WC_PROJECT:-}

NEXT_PUBLIC_MATCH_REGISTRY=$MATCH_REGISTRY
NEXT_PUBLIC_FANTASY_TEAM_NFT=$FANTASY_TEAM_NFT
NEXT_PUBLIC_LEGACY_PASSPORT=$LEGACY_PASSPORT
NEXT_PUBLIC_SCORE_MANAGER=$SCORE_MANAGER
NEXT_PUBLIC_CONTEST_MANAGER=$CONTEST_MANAGER

WIREFLUID_CHAIN_ID=$FORK_CHAIN_ID
WIREFLUID_RPC_URL=$RPC_URL
MATCH_REGISTRY=$MATCH_REGISTRY
FANTASY_TEAM_NFT=$FANTASY_TEAM_NFT
LEGACY_PASSPORT=$LEGACY_PASSPORT
SCORE_MANAGER=$SCORE_MANAGER
CONTEST_MANAGER=$CONTEST_MANAGER

AUTH_SESSION_SECRET=${EXISTING_AUTH:-c9f1984ac29f03cd1fde0fb5eb248f28a15a8c30059a969dbfd5e8a07eae78d0}
PLAYER_DATABASE_URL=${EXISTING_PLAYER_DB:-}
DIRECT_URL=${EXISTING_DIRECT_DB:-}
EOF
echo "   ✓ $WEB_ENV"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Fork setup complete!                              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Anvil fork : $RPC_URL (chain $FORK_CHAIN_ID)"
echo "  Anvil PID  : $ANVIL_PID  (to stop: kill $ANVIL_PID)"
echo "  Fork block : $FORK_BLOCK_DEC"
echo ""
echo "  Deployed Addresses:"
echo "    MatchRegistry  $MATCH_REGISTRY"
echo "    FantasyTeamNFT $FANTASY_TEAM_NFT"
echo "    LegacyPassport $LEGACY_PASSPORT"
echo "    ScoreManager   $SCORE_MANAGER"
echo "    ContestManager $CONTEST_MANAGER"
echo ""
echo "  Next steps (in separate terminals):"
echo "    Terminal 2 → pnpm dev:indexer"
echo "    Terminal 3 → pnpm dev:web"
echo ""
