import { getWireFluidChain, readWireFluidChainId } from "@wirefluid/contracts";
import { publicEnv } from "@/config/publicEnv";

export const configuredChainId = readWireFluidChainId(publicEnv, { publicPrefix: true });
export const wireFluidTestnet = getWireFluidChain(publicEnv, { publicPrefix: true });
