// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MatchStatus} from "../types/Structs.sol";

event MatchCreated(
    uint256 indexed matchId,
    bytes32 indexed homeTeam,
    bytes32 indexed awayTeam,
    uint64 startTime,
    uint64 lockTime,
    address operator
);
event MatchPlayersSet(
    uint256 indexed matchId,
    uint256 playerCount,
    uint16[] playerIds,
    uint8[] roles,
    uint8[] teamSides,
    address indexed operator
);
event MatchStatusUpdated(
    uint256 indexed matchId, MatchStatus previousStatus, MatchStatus newStatus, address indexed updater
);

event SquadMinted(
    uint256 indexed tokenId,
    address indexed owner,
    uint256 indexed matchId,
    uint16[11] playerIds,
    uint16 captainId,
    uint16 viceCaptainId,
    address minter
);
event SquadUpdated(
    uint256 indexed tokenId,
    uint256 indexed matchId,
    uint16[11] playerIds,
    uint16 captainId,
    uint16 viceCaptainId,
    address indexed updatedBy
);
event BaseURIUpdated(string baseURI, address indexed updater);

event LegacyPassportMinted(address indexed user, uint256 indexed tokenId, address indexed minter);
event LegacyEntryRecorded(
    address indexed user, uint256 indexed tokenId, uint32 contestsEntered, uint64 firstJoinedAt, uint64 lastActiveAt
);
event LegacyWinRecorded(address indexed user, uint256 indexed tokenId, uint32 contestsWon, uint64 lastActiveAt);
event LegacyRewardRecorded(
    address indexed user, uint256 indexed tokenId, uint256 amount, uint256 totalRewardsClaimed, uint64 lastActiveAt
);
event LegacyPassportBaseURIUpdated(string baseURI, address indexed updater);

event MatchStatsSubmitted(uint256 indexed matchId, uint256 playerCount, address indexed publisher);
event PlayerStatsRecorded(
    uint256 indexed matchId,
    uint16 indexed playerId,
    uint16 runs,
    uint8 fours,
    uint8 sixes,
    uint8 wickets,
    uint8 maidens,
    uint8 catches,
    uint8 stumpings,
    uint8 runOutDirect,
    uint8 runOutIndirect,
    bool duck,
    // Keep the event field aligned with cricket scoring terminology.
    // forge-lint: disable-next-line(mixed-case-variable)
    bool inStartingXI,
    bool substituteAppearance,
    int32 points
);
event PlayerPointsComputed(uint256 indexed matchId, uint16 indexed playerId, int32 points);

event ContestCreated(
    uint256 indexed contestId,
    uint256 indexed matchId,
    uint96 entryFee,
    uint16 maxEntries,
    uint8 maxEntriesPerWallet,
    address indexed operator
);
event ContestJoined(
    uint256 indexed contestId,
    uint256 indexed matchId,
    address indexed user,
    uint256 tokenId,
    uint256 passportTokenId,
    uint16 entryIndex
);
event EntryScoreComputed(
    uint256 indexed contestId,
    uint256 indexed matchId,
    address indexed user,
    uint16 entryIndex,
    uint256 tokenId,
    int32 score
);
event ContestWinnerRecorded(
    uint256 indexed contestId,
    uint256 indexed matchId,
    address indexed user,
    uint8 rank,
    uint16 entryIndex,
    uint256 tokenId,
    int32 score,
    uint256 reward
);
event ContestFinalized(
    uint256 indexed contestId,
    uint256 indexed matchId,
    uint16[3] winnerIndexes,
    uint256[3] winnerRewards,
    uint16 totalEntries,
    uint256 prizePool,
    uint256 treasuryFee,
    address indexed operator
);
event RefundCredited(
    uint256 indexed contestId,
    uint256 indexed matchId,
    address indexed user,
    uint256 tokenId,
    uint16 entryIndex,
    uint256 amount,
    uint256 newRefundableAmount
);
event ContestCancelled(
    uint256 indexed contestId,
    uint256 indexed matchId,
    uint256 refundedEntries,
    uint256 refundAmount,
    address indexed operator
);
event RewardClaimed(address indexed user, uint256 amount);
event RefundClaimed(address indexed user, uint256 amount);
event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury, address indexed updater);
event TreasuryAccrued(uint256 indexed contestId, uint256 indexed matchId, uint256 amount, uint256 newTreasuryClaimable);
event TreasuryClaimed(address indexed treasury, uint256 amount, address indexed claimer);
