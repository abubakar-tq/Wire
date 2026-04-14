import { keccak256, stringToBytes, zeroHash, type Hex } from "viem";

export const DEFAULT_ADMIN_ROLE = zeroHash;
export const MATCH_OPERATOR_ROLE = roleHash("OPERATOR_ROLE");
export const STATUS_UPDATER_ROLE = roleHash("STATUS_UPDATER_ROLE");
export const NFT_MINTER_ROLE = roleHash("MINTER_ROLE");
export const PASSPORT_MINTER_ROLE = NFT_MINTER_ROLE;
export const PASSPORT_RECORDER_ROLE = roleHash("RECORDER_ROLE");
export const SCORE_PUBLISHER_ROLE = roleHash("SCORE_PUBLISHER_ROLE");
export const CONTEST_OPERATOR_ROLE = MATCH_OPERATOR_ROLE;

export const adminRoleChecks = {
  defaultAdmin: DEFAULT_ADMIN_ROLE,
  matchOperator: MATCH_OPERATOR_ROLE,
  contestOperator: CONTEST_OPERATOR_ROLE,
  scorePublisher: SCORE_PUBLISHER_ROLE
} as const;

function roleHash(role: string): Hex {
  return keccak256(stringToBytes(role));
}
