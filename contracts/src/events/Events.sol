// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MatchStatus} from "../types/Structs.sol";

event MatchCreated(
    uint256 indexed matchId, bytes32 indexed homeTeam, bytes32 indexed awayTeam, uint64 startTime, uint64 lockTime
);
event MatchPlayersSet(uint256 indexed matchId, uint256 playerCount);
event MatchStatusUpdated(uint256 indexed matchId, MatchStatus previousStatus, MatchStatus newStatus);

event SquadMinted(
    uint256 indexed tokenId,
    address indexed owner,
    uint256 indexed matchId,
    uint16[11] playerIds,
    uint16 captainId,
    uint16 viceCaptainId
);
event SquadUpdated(
    uint256 indexed tokenId, uint256 indexed matchId, uint16[11] playerIds, uint16 captainId, uint16 viceCaptainId
);
event BaseURIUpdated(string baseURI);

event LegacyPassportMinted(address indexed user, uint256 indexed tokenId);
event LegacyEntryRecorded(address indexed user, uint256 indexed tokenId, uint32 contestsEntered);
event LegacyWinRecorded(address indexed user, uint256 indexed tokenId, uint32 contestsWon);
event LegacyRewardRecorded(address indexed user, uint256 indexed tokenId, uint256 amount, uint256 totalRewardsClaimed);
event LegacyPassportBaseURIUpdated(string baseURI);

event MatchStatsSubmitted(uint256 indexed matchId, uint256 playerCount);
event PlayerPointsComputed(uint256 indexed matchId, uint16 indexed playerId, int32 points);

event ContestCreated(
    uint256 indexed contestId, uint256 indexed matchId, uint96 entryFee, uint16 maxEntries, uint8 maxEntriesPerWallet
);
event ContestJoined(
    uint256 indexed contestId, uint256 indexed matchId, address indexed user, uint256 tokenId, uint16 entryIndex
);
event ContestFinalized(
    uint256 indexed contestId,
    uint256 indexed matchId,
    uint16[3] winnerIndexes,
    uint256[3] winnerRewards,
    uint256 treasuryFee
);
event ContestCancelled(uint256 indexed contestId, uint256 indexed matchId, uint256 refundedEntries);
event RewardClaimed(address indexed user, uint256 amount);
event RefundClaimed(address indexed user, uint256 amount);
event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);
event TreasuryClaimed(address indexed treasury, uint256 amount);
