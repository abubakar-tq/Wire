import { parseAbi } from "viem";

const accessControlAbiItems = [
  "function hasRole(bytes32 role, address account) view returns (bool)"
] as const;

export const accessControlAbi = parseAbi(accessControlAbiItems);

export const matchRegistryAbi = parseAbi([
  "event MatchCreated(uint256 indexed matchId, bytes32 indexed homeTeam, bytes32 indexed awayTeam, uint64 startTime, uint64 lockTime, address operator)",
  "event MatchPlayersSet(uint256 indexed matchId, uint256 playerCount, uint16[] playerIds, uint8[] roles, uint8[] teamSides, address indexed operator)",
  "event MatchStatusUpdated(uint256 indexed matchId, uint8 previousStatus, uint8 newStatus, address indexed updater)",
  "function OPERATOR_ROLE() view returns (bytes32)",
  "function STATUS_UPDATER_ROLE() view returns (bytes32)",
  "function createMatch(uint256 matchId, bytes32 homeTeam, bytes32 awayTeam, uint64 startTime, uint64 lockTime)",
  "function setMatchPlayers(uint256 matchId, uint16[] playerIds, uint8[] roles, uint8[] teamSides)",
  "function updateMatchStatus(uint256 matchId, uint8 newStatus)",
  "function getMatch(uint256 matchId) view returns ((uint64 startTime, uint64 lockTime, uint8 status, bytes32 homeTeam, bytes32 awayTeam, bool exists))",
  "function getMatchPlayerIds(uint256 matchId) view returns (uint16[])",
  "function getPlayerMeta(uint256 matchId, uint16 playerId) view returns ((uint16 playerId, uint8 role, uint8 teamSide, bool allowed))",
  "function isLocked(uint256 matchId) view returns (bool)",
  "function isPlayerAllowed(uint256 matchId, uint16 playerId) view returns (bool)",
  ...accessControlAbiItems
]);

export const fantasyTeamNftAbi = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event SquadMinted(uint256 indexed tokenId, address indexed owner, uint256 indexed matchId, uint16[11] playerIds, uint16 captainId, uint16 viceCaptainId, address minter)",
  "event SquadUpdated(uint256 indexed tokenId, uint256 indexed matchId, uint16[11] playerIds, uint16 captainId, uint16 viceCaptainId, address indexed updatedBy)",
  "event BaseURIUpdated(string baseURI, address indexed updater)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function matchRegistry() view returns (address)",
  "function nextTokenId() view returns (uint256)",
  "function setBaseURI(string baseUri)",
  "function updateSquad(uint256 tokenId, uint16[11] playerIds, uint16 captainId, uint16 viceCaptainId)",
  "function getSquad(uint256 tokenId) view returns ((uint256 matchId, uint16[11] playerIds, uint16 captainId, uint16 viceCaptainId, bool exists))",
  "function squadMatchId(uint256 tokenId) view returns (uint256)",
  "function isSquadLocked(uint256 tokenId) view returns (bool)",
  "function isTransferLocked(uint256 tokenId) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  ...accessControlAbiItems
]);

export const legacyPassportAbi = parseAbi([
  "event LegacyPassportMinted(address indexed user, uint256 indexed tokenId, address indexed minter)",
  "event LegacyEntryRecorded(address indexed user, uint256 indexed tokenId, uint32 contestsEntered, uint64 firstJoinedAt, uint64 lastActiveAt)",
  "event LegacyWinRecorded(address indexed user, uint256 indexed tokenId, uint32 contestsWon, uint64 lastActiveAt)",
  "event LegacyRewardRecorded(address indexed user, uint256 indexed tokenId, uint256 amount, uint256 totalRewardsClaimed, uint64 lastActiveAt)",
  "event LegacyPassportBaseURIUpdated(string baseURI, address indexed updater)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function RECORDER_ROLE() view returns (bytes32)",
  "function setBaseURI(string baseUri)",
  "function mintPassport(address user) returns (uint256)",
  "function hasPassport(address user) view returns (bool)",
  "function passportOf(address user) view returns (uint256)",
  "function getStats(address user) view returns ((uint32 contestsEntered, uint32 contestsWon, uint256 totalRewardsClaimed, uint64 firstJoinedAt, uint64 lastActiveAt))",
  "function tokenURI(uint256 tokenId) view returns (string)",
  ...accessControlAbiItems
]);

export const scoreManagerAbi = parseAbi([
  "event MatchStatsSubmitted(uint256 indexed matchId, uint256 playerCount, address indexed publisher)",
  "event PlayerStatsRecorded(uint256 indexed matchId, uint16 indexed playerId, uint16 runs, uint8 fours, uint8 sixes, uint8 wickets, uint8 maidens, uint8 catches, uint8 stumpings, uint8 runOutDirect, uint8 runOutIndirect, bool duck, bool inStartingXI, bool substituteAppearance, int32 points)",
  "event PlayerPointsComputed(uint256 indexed matchId, uint16 indexed playerId, int32 points)",
  "function SCORE_PUBLISHER_ROLE() view returns (bytes32)",
  "function submitMatchStats(uint256 matchId, uint16[] playerIds, (uint16 runs, uint8 fours, uint8 sixes, uint8 wickets, uint8 maidens, uint8 catches, uint8 stumpings, uint8 runOutDirect, uint8 runOutIndirect, bool duck, bool inStartingXI, bool substituteAppearance)[] stats)",
  "function getPlayerPoints(uint256 matchId, uint16 playerId) view returns (int32)",
  "function getPlayerStats(uint256 matchId, uint16 playerId) view returns ((uint16 runs, uint8 fours, uint8 sixes, uint8 wickets, uint8 maidens, uint8 catches, uint8 stumpings, uint8 runOutDirect, uint8 runOutIndirect, bool duck, bool inStartingXI, bool substituteAppearance))",
  "function hasStats(uint256 matchId) view returns (bool)",
  ...accessControlAbiItems
]);

export const contestManagerAbi = parseAbi([
  "event ContestCreated(uint256 indexed contestId, uint256 indexed matchId, uint96 entryFee, uint16 maxEntries, uint8 maxEntriesPerWallet, address indexed operator)",
  "event ContestJoined(uint256 indexed contestId, uint256 indexed matchId, address indexed user, uint256 tokenId, uint256 passportTokenId, uint16 entryIndex)",
  "event EntryScoreComputed(uint256 indexed contestId, uint256 indexed matchId, address indexed user, uint16 entryIndex, uint256 tokenId, int32 score)",
  "event ContestWinnerRecorded(uint256 indexed contestId, uint256 indexed matchId, address indexed user, uint8 rank, uint16 entryIndex, uint256 tokenId, int32 score, uint256 reward)",
  "event ContestFinalized(uint256 indexed contestId, uint256 indexed matchId, uint16[3] winnerIndexes, uint256[3] winnerRewards, uint16 totalEntries, uint256 prizePool, uint256 treasuryFee, address indexed operator)",
  "event RefundCredited(uint256 indexed contestId, uint256 indexed matchId, address indexed user, uint256 tokenId, uint16 entryIndex, uint256 amount, uint256 newRefundableAmount)",
  "event ContestCancelled(uint256 indexed contestId, uint256 indexed matchId, uint256 refundedEntries, uint256 refundAmount, address indexed operator)",
  "event RewardClaimed(address indexed user, uint256 amount)",
  "event RefundClaimed(address indexed user, uint256 amount)",
  "event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury, address indexed updater)",
  "event TreasuryAccrued(uint256 indexed contestId, uint256 indexed matchId, uint256 amount, uint256 newTreasuryClaimable)",
  "event TreasuryClaimed(address indexed treasury, uint256 amount, address indexed claimer)",
  "function OPERATOR_ROLE() view returns (bytes32)",
  "function matchRegistry() view returns (address)",
  "function fantasyTeamNFT() view returns (address)",
  "function scoreManager() view returns (address)",
  "function legacyPassport() view returns (address)",
  "function createContest(uint256 contestId, uint256 matchId, uint96 entryFee, uint16 maxEntries, uint8 maxEntriesPerWallet)",
  "function joinContest(uint256 contestId, uint16[11] playerIds, uint16 captainId, uint16 viceCaptainId) payable returns (uint256)",
  "function finalizeContest(uint256 contestId)",
  "function cancelContest(uint256 contestId)",
  "function claimTreasury()",
  "function claimReward()",
  "function claimRefund()",
  "function setTreasury(address newTreasury)",
  "function treasury() view returns (address)",
  "function treasuryClaimable() view returns (uint256)",
  "function contestIdByMatch(uint256 matchId) view returns (uint256)",
  "function entriesByWallet(uint256 contestId, address user) view returns (uint8)",
  "function claimableRewards(address user) view returns (uint256)",
  "function refundableEntries(address user) view returns (uint256)",
  "function getContest(uint256 contestId) view returns ((uint256 matchId, uint96 entryFee, uint16 maxEntries, uint8 maxEntriesPerWallet, uint16 totalEntries, bool finalized, bool cancelled, bool exists))",
  "function getEntry(uint256 contestId, uint256 entryIndex) view returns ((address user, uint256 tokenId, int32 score, uint64 joinedAt))",
  "function getEntryCount(uint256 contestId) view returns (uint256)",
  "function getContestEntries(uint256 contestId) view returns ((address user, uint256 tokenId, int32 score, uint64 joinedAt)[])",
  "function getWinners(uint256 contestId) view returns (uint16[3], uint256[3])",
  "function getClaimableReward(address user) view returns (uint256)",
  "function getRefundableEntryAmount(address user) view returns (uint256)",
  "function previewSquadScore(uint256 matchId, uint256 tokenId) view returns (int32)",
  ...accessControlAbiItems
]);

export const arenaAbis = {
  matchRegistry: matchRegistryAbi,
  fantasyTeamNft: fantasyTeamNftAbi,
  legacyPassport: legacyPassportAbi,
  scoreManager: scoreManagerAbi,
  contestManager: contestManagerAbi
} as const;
