import { getContractAddresses, hasConfiguredAddresses } from "@wirefluid/contracts";
import { publicEnv } from "@/config/publicEnv";

export const contractAddresses = getContractAddresses(publicEnv, {
  publicPrefix: true,
  strict: false
});

export const contractsConfigured = hasConfiguredAddresses(contractAddresses);
