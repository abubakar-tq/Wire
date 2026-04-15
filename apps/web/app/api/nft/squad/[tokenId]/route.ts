import { NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { nftMetadata } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = parseInt(params.tokenId);
  if (isNaN(tokenId)) {
    return NextResponse.json({ error: "Invalid Token ID" }, { status: 400 });
  }

  const db = getDb();
  const [record] = await db
    .select()
    .from(nftMetadata)
    .where(
      and(
        eq(nftMetadata.nftType, "squad"),
        eq(nftMetadata.tokenId, tokenId)
      )
    )
    .limit(1);

  if (!record || !record.metadataUri) {
    return NextResponse.json({
      name: `WireFluid Fantasy Squad #${tokenId}`,
      description: "Syncing squad metadata to IPFS...",
      image: "https://via.placeholder.com/400x600?text=Syncing+Metadata..."
    });
  }

  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL ? `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/` : "https://gateway.pinata.cloud/ipfs/";
  const cid = record.metadataUri.replace("ipfs://", "");
  
  return NextResponse.redirect(new URL(`${gateway}${cid}`));
}
