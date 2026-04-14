// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

uint8 constant SQUAD_SIZE = 11;
uint16 constant MAX_PLAYERS_PER_MATCH = 32;
uint16 constant MAX_ENTRIES_PER_CONTEST = 25;
uint8 constant MAX_ENTRIES_PER_WALLET = 3;
uint16 constant MIN_ENTRIES_TO_FINALIZE = 3;
uint8 constant HOME_TEAM_SIDE = 1;
uint8 constant AWAY_TEAM_SIDE = 2;

enum RoleType {
    WK,
    BAT,
    AR,
    BOWL
}

enum MatchStatus {
    Scheduled,
    Locked,
    StatsSubmitted,
    Finalized,
    Cancelled
}

struct MatchInfo {
    uint64 startTime;
    uint64 lockTime;
    MatchStatus status;
    bytes32 homeTeam;
    bytes32 awayTeam;
    bool exists;
}

struct PlayerMeta {
    uint16 playerId;
    uint8 role;
    uint8 teamSide;
    bool allowed;
}

struct Squad {
    uint256 matchId;
    uint16[11] playerIds;
    uint16 captainId;
    uint16 viceCaptainId;
    bool exists;
}

struct PlayerStats {
    uint16 runs;
    uint8 fours;
    uint8 sixes;
    uint8 wickets;
    uint8 maidens;
    uint8 catches;
    uint8 stumpings;
    uint8 runOutDirect;
    uint8 runOutIndirect;
    bool duck;
    // Keep the API name aligned with cricket scoring terminology.
    // forge-lint: disable-next-line(mixed-case-variable)
    bool inStartingXI;
    bool substituteAppearance;
}

struct Contest {
    uint256 matchId;
    uint96 entryFee;
    uint16 maxEntries;
    uint8 maxEntriesPerWallet;
    uint16 totalEntries;
    bool finalized;
    bool cancelled;
    bool exists;
}

struct Entry {
    address user;
    uint256 tokenId;
    int32 score;
    uint64 joinedAt;
}

struct LegacyStats {
    uint32 contestsEntered;
    uint32 contestsWon;
    uint256 totalRewardsClaimed;
    uint64 firstJoinedAt;
    uint64 lastActiveAt;
}
