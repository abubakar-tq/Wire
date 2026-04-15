import { NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { nftMetadata } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * @route GET /api/nft/passport/[tokenId]
 * @description Decentralized metadata resolution API for Wirefluid Passports.
 * Next.js 15+ native App Router endpoint that securely intercepts on-chain tokenURI requests,
 * queries the Neon database for the pinned IPFS gateway mapping, and resolves the actual 
 * Pinata JSON directly back to the requesting wallet (e.g., MetaMask).
 *
 * @param request Standard HTTP Request
 * @param context Dynamic routing context containing the deeply awaited token parameters.
 */
export async function GET(request: Request, context: { params: Promise<{ tokenId: string }> }) {
  const { tokenId: tokenIdStr } = await context.params;
  const tokenId = parseInt(tokenIdStr);
  if (isNaN(tokenId)) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  try {
    const db = getDb();
    const [metadata] = await db
      .select({
        metadataUri: nftMetadata.metadataUri
      })
      .from(nftMetadata)
      .where(and(eq(nftMetadata.nftType, "passport"), eq(nftMetadata.tokenId, tokenId)))
      .limit(1);

    if (!metadata || !metadata.metadataUri) {
      // Return a placeholder structure to satisfy MetaMask early
      return NextResponse.json({
        name: `WireFluid Passport #${tokenId}`,
        description: "Processing dynamic metadata...",
        image: `https://api.dicebear.com/9.x/bottts-neutral/png?seed=passport-${tokenId}&backgroundColor=e5e7eb`
      });
    }

    const gatewayUrl = metadata.metadataUri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    const response = await fetch(gatewayUrl);
    
    if (!response.ok) {
      throw new Error("Failed to fetch from Pinata");
    }

    const jsonData = await response.json();
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Endpoint Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
