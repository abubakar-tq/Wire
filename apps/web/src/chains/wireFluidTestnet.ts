import { getWireFluidChain, readWireFluidChainId } from "@wirefluid/contracts";

export const configuredChainId = readWireFluidChainId(process.env, { publicPrefix: true });
export const wireFluidTestnet = getWireFluidChain(process.env, { publicPrefix: true });
