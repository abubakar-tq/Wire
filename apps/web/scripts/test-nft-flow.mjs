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
import { pgTable, integer, text, timestamp, bigint, pgSchema } from "drizzle-orm/pg-core";
import pinataSDK from "@pinata/sdk";
import stream from "stream";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const queryConnection = neon(connectionString);
const db = drizzle(queryConnection);
const appSchema = pgSchema("app");
const pinataJwt = process.env.PINATA_JWT;
if (!pinataJwt) throw new Error("PINATA_JWT is required");

const pinata = new pinataSDK({ pinataJWTKey: pinataJwt });

// --- Schemas ---
const public_passports = pgTable("passports", {
  id: text("id").primaryKey(),
  user: text("user").notNull(),
  tokenId: bigint("token_id", { mode: "number" }).notNull(),
  contestsEntered: integer("contests_entered").notNull(),
  contestsWon: integer("contests_won").notNull(),
  totalRewardsClaimed: bigint("total_rewards_claimed", { mode: "bigint" }).notNull(),
  mintedAtBlock: bigint("minted_at_block", { mode: "number" }).notNull(),
  updatedAtBlock: bigint("updated_at_block", { mode: "number" }).notNull()
});

const nft_metadata = appSchema.table("nft_metadata", {
  id: text("id").primaryKey(),
  nftType: text("nft_type").notNull(),
  tokenId: integer("token_id").notNull(),
  imageUri: text("image_uri"),
  metadataUri: text("metadata_uri"),
  lastSyncedBlock: integer("last_synced_block").notNull()
});

async function runTest() {
  const testTokenId = 888888;
  const testAddress = "0xde4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

  console.log("🧪 Mocking real Passport #888888 data with LEGACY SDK...");
  await db.insert(public_passports).values({
    id: `mock-${testTokenId}`,
    user: testAddress,
    tokenId: testTokenId,
    contestsEntered: 100,
    contestsWon: 50,
    totalRewardsClaimed: 1000000000000000000n, // 1 ETH
    mintedAtBlock: 1,
    updatedAtBlock: 999
  }).onConflictDoUpdate({ target: public_passports.id, set: { updatedAtBlock: 999 } });

  console.log("------------------------------------------");
  console.log("Running IPFS Upload (Legacy API)...");
  
  const testSvg = `<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="blue" /><text x="50%" y="300" text-anchor="middle" fill="white" font-size="20">LEGACY TEST #${testTokenId}</text></svg>`;
  const svgStream = new stream.Readable();
  svgStream.push(testSvg);
  svgStream.push(null);

  const imgUpload = await pinata.pinFileToIPFS(svgStream, { pinataMetadata: { name: "test-legacy.svg" } });
  const imageUri = `ipfs://${imgUpload.IpfsHash}`;
  
  const metadata = {
    name: `Legacy Test Passport #${testTokenId}`,
    description: "Verified IPFS Metadata Syncing Test (Legacy SDK)",
    image: imageUri
  };
  
  const metaUpload = await pinata.pinJSONToIPFS(metadata, { pinataMetadata: { name: "test-legacy.json" } });
  const metadataUri = `ipfs://${metaUpload.IpfsHash}`;

  console.log(`✅ Upload Success!`);
  console.log(`🖼 Image URI: ${imageUri}`);
  console.log(`📄 Metadata URI: ${metadataUri}`);

  await db.insert(nft_metadata).values({
    id: `passport-${testTokenId}`,
    nftType: "passport",
    tokenId: testTokenId,
    imageUri,
    metadataUri,
    lastSyncedBlock: 999
  }).onConflictDoUpdate({ target: nft_metadata.id, set: { imageUri, metadataUri, lastSyncedBlock: 999 } });

  console.log("------------------------------------------");
  console.log("✅ TEST COMPLETE: Legacy SDK successfully uploaded and tracked.");
}
runTest().catch(console.error);
