import { PinataSDK } from "pinata";

const pinataJwt = process.env.PINATA_JWT;
const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "gateway.pinata.cloud";

export function getPinataClient() {
  if (!pinataJwt) {
    throw new Error("PINATA_JWT environment variable is missing");
  }

  return new PinataSDK({
    pinataJwt,
    pinataGateway: gatewayUrl
  });
}

/**
 * Uploads a string (SVG) to Pinata IPFS.
 * Returns the CID or ipfs:// uri.
 */
export async function uploadNftImage(name: string, svgContent: string) {
  const pinata = getPinataClient();
  const file = new File([svgContent], `${name}.svg`, { type: "image/svg+xml" });
  const upload = await pinata.upload.file(file);
  return `ipfs://${upload.cid}`;
}

/**
 * Uploads NFT metadata JSON to Pinata IPFS.
 * Returns the CID or ipfs:// uri.
 */
export async function uploadNftMetadata(name: string, metadata: Record<string, any>) {
  const pinata = getPinataClient();
  const upload = await pinata.upload.json(metadata);
  return `ipfs://${upload.cid}`;
}
