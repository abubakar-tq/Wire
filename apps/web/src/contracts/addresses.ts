import { getContractAddresses, hasConfiguredAddresses } from "@wirefluid/contracts";

export const contractAddresses = getContractAddresses(process.env, {
  publicPrefix: true,
  strict: false
});

export const contractsConfigured = hasConfiguredAddresses(contractAddresses);
