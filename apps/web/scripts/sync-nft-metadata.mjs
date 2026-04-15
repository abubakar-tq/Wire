import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../../.env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql, and, inArray } from "drizzle-orm";
import { pgTable, integer, text, timestamp, bigint, jsonb, pgSchema } from "drizzle-orm/pg-core";
import pinataSDK from "@pinata/sdk";
import stream from "stream";

// --- Database & Pinata Config ---
const connectionString = process.env.PLAYER_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("PLAYER_DATABASE_URL or DATABASE_URL is required");

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

async function uploadToIPFS(name, buffer, metadata) {
  try {
    const bufferStream = new stream.Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    const imgUpload = await pinata.pinFileToIPFS(bufferStream, {
      pinataMetadata: { name: `${name}.png` }
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

async function fetchAvatarBuffer(seed) {
  const url = `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${seed}&backgroundColor=e5e7eb`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch avatar: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
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
    const buffer = await fetchAvatarBuffer(`passport-${p.tokenId}`);
    const metadata = {
      name: `WireFluid Passport #${p.tokenId}`,
      description: "A dynamic passport tracking your WireFluid activity and stats.",
      attributes: [
        { trait_type: "Contests Entered", value: p.contestsEntered },
        { trait_type: "Contests Won", value: p.contestsWon },
        { trait_type: "Total Rewards", value: p.totalRewardsClaimed.toString() }
      ]
    };
    const { imageUri, metadataUri } = await uploadToIPFS(`passport-${p.tokenId}`, buffer, metadata);
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
    const playersInSquad = await db.select().from(app_players).where(inArray(app_players.playerId, s.playerIds));
    const buffer = await fetchAvatarBuffer(`squad-${s.tokenId}`);
    const metadata = {
      name: `WireFluid Fantasy Squad #${s.tokenId}`,
      description: `A custom-built fantasy squad for Match #${s.matchId}.`,
      attributes: [
        { trait_type: "Match ID", value: s.matchId },
        { trait_type: "Captain ID", value: s.captainId }
      ]
    };
    const { imageUri, metadataUri } = await uploadToIPFS(`squad-${s.tokenId}`, buffer, metadata);
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

/**
 * @function run
 * @description Master synchronization pipeline. 
 * Orchestrates the bridging of PostgreSQL indexer states to Pinata Cloud IPFS.
 * It natively extracts generated PNG buffers from external Web2 endpoints, authenticates
 * via the Pinata SDK, and permanently maps the immutable Web3 assets back to the DB to be securely exposed.
 */
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
