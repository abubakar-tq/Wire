import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../../../.env") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql, and } from "drizzle-orm";
import { pgTable, integer, text, timestamp, bigint, jsonb, pgSchema } from "drizzle-orm/pg-core";
import pinataSDK from "@pinata/sdk";
import stream from "stream";

// --- Database & Pinata Config ---
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const queryConnection = neon(connectionString);
const db = drizzle(queryConnection);

const appSchema = pgSchema("app");
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

// --- Schema Definitions ---
const public_passports = pgTable("passports", {
  id: text("id").primaryKey(),
  user: text("user").notNull(),
  tokenId: bigint("token_id", { mode: "number" }).notNull(),
  contestsEntered: integer("contests_entered").notNull(),
  contestsWon: integer("contests_won").notNull(),
  totalRewardsClaimed: bigint("total_rewards_claimed", { mode: "bigint" }).notNull(),
  updatedAtBlock: bigint("updated_at_block", { mode: "number" }).notNull()
});

const public_squads = pgTable("squads", {
  id: text("id").primaryKey(),
  tokenId: bigint("token_id", { mode: "number" }).notNull(),
  matchId: bigint("match_id", { mode: "number" }).notNull(),
  playerIds: jsonb("player_ids").notNull(),
  captainId: integer("captain_id").notNull(),
  viceCaptainId: integer("vice_captain_id").notNull(),
  updatedAtBlock: bigint("updated_at_block", { mode: "number" }).notNull()
});

const app_players = appSchema.table("players", {
  playerId: integer("player_id").primaryKey(),
  displayName: text("display_name").notNull(),
  teamCode: text("team_code")
});

const nft_metadata = appSchema.table("nft_metadata", {
  id: text("id").primaryKey(),
  nftType: text("nft_type").notNull(),
  tokenId: integer("token_id").notNull(),
  imageUri: text("image_uri"),
  metadataUri: text("metadata_uri"),
  lastSyncedBlock: integer("last_synced_block").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// --- Helper Functions ---

async function uploadToIPFS(name, svg, metadata) {
  try {
    // Generate buffer from SVG
    const svgStream = new stream.Readable();
    svgStream.push(svg);
    svgStream.push(null);

    const imgUpload = await pinata.pinFileToIPFS(svgStream, {
      pinataMetadata: { name: `${name}.svg` }
    });
    const imageUri = `ipfs://${imgUpload.IpfsHash}`;

    const fullMetadata = {
      ...metadata,
      image: imageUri
    };

    const metaUpload = await pinata.pinJSONToIPFS(fullMetadata, {
      pinataMetadata: { name: `${name}.json` }
    });
    return { imageUri, metadataUri: `ipfs://${metaUpload.IpfsHash}` };
  } catch (err) {
    console.error(`IPFS Upload failed for ${name}:`, err.message);
    throw err;
  }
}

function generatePassportSvg(p) {
  return `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2a2a72;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#009ffd;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" rx="20" />
    <text x="50%" y="80" text-anchor="middle" fill="white" font-family="Arial" font-size="28" font-weight="bold">WIREFLUID PASSPORT</text>
    <text x="50%" y="150" text-anchor="middle" fill="#00d2ff" font-family="Arial" font-size="22">TOKEN #${p.tokenId}</text>
    <line x1="10%" y1="200" x2="90%" y2="200" stroke="white" stroke-width="2" opacity="0.3" />
    <text x="10%" y="260" fill="white" font-family="Arial" font-size="18">CONTESTS: ${p.contestsEntered}</text>
    <text x="10%" y="300" fill="white" font-family="Arial" font-size="18">WINS: ${p.contestsWon}</text>
    <text x="10%" y="340" fill="white" font-family="Arial" font-size="18">REWARDS: ${p.totalRewardsClaimed.toString()}</text>
    <text x="50%" y="550" text-anchor="middle" fill="white" font-family="Arial" font-size="14" opacity="0.5">${p.user}</text>
  </svg>`;
}

function generateSquadSvg(s, players) {
  const playerList = players.map((p, i) => `<text x="10%" y="${220 + i * 30}" fill="white" font-family="Arial" font-size="14">${i + 1}. ${p.displayName} (${p.teamCode}) ${p.playerId === s.captainId ? '[C]' : p.playerId === s.viceCaptainId ? '[VC]' : ''}</text>`).join("");
  return `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#330000;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff0044;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" rx="20" />
    <text x="50%" y="80" text-anchor="middle" fill="white" font-family="Arial" font-size="28" font-weight="bold">FANTASY SQUAD</text>
    <text x="50%" y="150" text-anchor="middle" fill="#ffcc00" font-family="Arial" font-size="22">TOKEN #${s.tokenId}</text>
    <line x1="10%" y1="180" x2="90%" y2="180" stroke="white" stroke-width="2" opacity="0.3" />
    ${playerList}
    <text x="50%" y="580" text-anchor="middle" fill="white" font-family="Arial" font-size="12" opacity="0.5">MATCH ID: ${s.matchId}</text>
  </svg>`;
}

// --- Logic ---

async function syncPassports() {
  console.log("Syncing Passports...");
  const passportsToSync = await db
    .select({
      id: public_passports.id,
      user: public_passports.user,
      tokenId: public_passports.tokenId,
      contestsEntered: public_passports.contestsEntered,
      contestsWon: public_passports.contestsWon,
      totalRewardsClaimed: public_passports.totalRewardsClaimed,
      updatedAtBlock: public_passports.updatedAtBlock,
      meta: nft_metadata
    })
    .from(public_passports)
    .leftJoin(nft_metadata, and(eq(nft_metadata.nftType, "passport"), eq(nft_metadata.tokenId, public_passports.tokenId)))
    .where(sql`${public_passports.updatedAtBlock} > COALESCE(${nft_metadata.lastSyncedBlock}, 0)`);

  for (const p of passportsToSync) {
    console.log(`Processing Passport #${p.tokenId}...`);
    const svg = generatePassportSvg(p);
    const metadata = {
      name: `WireFluid Passport #${p.tokenId}`,
      description: "A dynamic passport tracking your WireFluid activity and stats.",
      attributes: [
        { trait_type: "Contests Entered", value: p.contestsEntered },
        { trait_type: "Contests Won", value: p.contestsWon },
        { trait_type: "Total Rewards", value: p.totalRewardsClaimed.toString() }
      ]
    };
    const { imageUri, metadataUri } = await uploadToIPFS(`passport-${p.tokenId}`, svg, metadata);
    await db.insert(nft_metadata).values({
      id: `passport-${p.tokenId}`,
      nftType: "passport",
      tokenId: p.tokenId,
      imageUri,
      metadataUri,
      lastSyncedBlock: p.updatedAtBlock
    }).onConflictDoUpdate({ target: nft_metadata.id, set: { imageUri, metadataUri, lastSyncedBlock: p.updatedAtBlock, updatedAt: sql`now()` } });
  }
}

async function syncSquads() {
  console.log("Syncing Squads...");
  const squadsToSync = await db
    .select({
      id: public_squads.id,
      tokenId: public_squads.tokenId,
      matchId: public_squads.matchId,
      playerIds: public_squads.playerIds,
      captainId: public_squads.captainId,
      viceCaptainId: public_squads.viceCaptainId,
      updatedAtBlock: public_squads.updatedAtBlock
    })
    .from(public_squads)
    .leftJoin(nft_metadata, and(eq(nft_metadata.nftType, "squad"), eq(nft_metadata.tokenId, public_squads.tokenId)))
    .where(sql`${public_squads.updatedAtBlock} > COALESCE(${nft_metadata.lastSyncedBlock}, 0)`);

  for (const s of squadsToSync) {
    console.log(`Processing Squad #${s.tokenId}...`);
    const playersInSquad = await db.select().from(app_players).where(sql`${app_players.playerId} IN (${sql.join(s.playerIds)})`);
    const svg = generateSquadSvg(s, playersInSquad);
    const metadata = {
      name: `WireFluid Fantasy Squad #${s.tokenId}`,
      description: `A custom-built fantasy squad for Match #${s.matchId}.`,
      attributes: [
        { trait_type: "Match ID", value: s.matchId },
        { trait_type: "Captain ID", value: s.captainId }
      ]
    };
    const { imageUri, metadataUri } = await uploadToIPFS(`squad-${s.tokenId}`, svg, metadata);
    await db.insert(nft_metadata).values({
      id: `squad-${s.tokenId}`,
      nftType: "squad",
      tokenId: s.tokenId,
      imageUri,
      metadataUri,
      lastSyncedBlock: s.updatedAtBlock
    }).onConflictDoUpdate({ target: nft_metadata.id, set: { imageUri, metadataUri, lastSyncedBlock: s.updatedAtBlock, updatedAt: sql`now()` } });
  }
}

async function run() {
  if (!process.env.PINATA_JWT) { console.error("❌ SKIPPING SYNC: PINATA_JWT is not set in .env"); return; }
  try {
    await syncPassports();
    await syncSquads();
    console.log("✅ Sync completed.");
  } catch (err) {
    console.error("❌ Sync Error:", err);
  }
}
run();
