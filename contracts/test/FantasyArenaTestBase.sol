// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {ContestManager} from "../src/ContestManager.sol";
import {FantasyTeamNFT} from "../src/FantasyTeamNFT.sol";
import {IFantasyTeamNFT} from "../src/interfaces/IFantasyTeamNFT.sol";
import {ILegacyPassport} from "../src/interfaces/ILegacyPassport.sol";
import {IMatchRegistry} from "../src/interfaces/IMatchRegistry.sol";
import {IScoreManager} from "../src/interfaces/IScoreManager.sol";
import {LegacyPassport} from "../src/LegacyPassport.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";
import {ScoreManager} from "../src/ScoreManager.sol";
import {
    AWAY_TEAM_SIDE,
    HOME_TEAM_SIDE,
    MAX_ENTRIES_PER_CONTEST,
    MAX_ENTRIES_PER_WALLET,
    PlayerStats,
    RoleType
} from "../src/types/Structs.sol";

abstract contract FantasyArenaTestBase is Test {
    MatchRegistry internal registry;
    FantasyTeamNFT internal nft;
    ScoreManager internal scores;
    LegacyPassport internal passport;
    ContestManager internal contests;

    address internal admin = address(this);
    address internal publisher = address(0xA11CE);
    address internal alice = address(0xA1);
    address internal bob = address(0xB0B);
    address internal carol = address(0xCA);
    address internal dave = address(0xD0);
    address internal treasury = address(0x777);

    uint256 internal constant MATCH_ID = 1;
    uint256 internal constant CONTEST_ID = 100;
    uint96 internal constant ENTRY_FEE = 1 ether;
    bytes32 internal constant HOME_TEAM = 0x574952455f484f4d450000000000000000000000000000000000000000000000;
    bytes32 internal constant AWAY_TEAM = 0x574952455f415741590000000000000000000000000000000000000000000000;

    function setUp() public virtual {
        vm.warp(1_000);

        registry = new MatchRegistry();
        nft = new FantasyTeamNFT(IMatchRegistry(address(registry)));
        scores = new ScoreManager(IMatchRegistry(address(registry)));
        passport = new LegacyPassport();
        contests = new ContestManager(
            IMatchRegistry(address(registry)),
            IFantasyTeamNFT(address(nft)),
            IScoreManager(address(scores)),
            ILegacyPassport(address(passport))
        );

        nft.grantRole(nft.MINTER_ROLE(), address(contests));
        passport.grantRole(passport.MINTER_ROLE(), address(contests));
        passport.grantRole(passport.RECORDER_ROLE(), address(contests));
        scores.grantRole(scores.SCORE_PUBLISHER_ROLE(), publisher);
        registry.grantRole(registry.STATUS_UPDATER_ROLE(), address(scores));
        registry.grantRole(registry.STATUS_UPDATER_ROLE(), address(contests));
        contests.setTreasury(treasury);

        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
        vm.deal(dave, 100 ether);
    }

    function _createMatch() internal {
        registry.createMatch(
            MATCH_ID, HOME_TEAM, AWAY_TEAM, uint64(block.timestamp + 2 days), uint64(block.timestamp + 1 days)
        );
    }

    function _createMatch(uint256 matchId) internal {
        registry.createMatch(
            matchId, HOME_TEAM, AWAY_TEAM, uint64(block.timestamp + 2 days), uint64(block.timestamp + 1 days)
        );
    }

    function _seedPlayers(uint256 matchId) internal {
        (uint16[] memory playerIds, uint8[] memory roles, uint8[] memory teamSides) = _playerPool();
        registry.setMatchPlayers(matchId, playerIds, roles, teamSides);
    }

    function _createMatchWithPlayers() internal {
        _createMatch();
        _seedPlayers(MATCH_ID);
    }

    function _warpPastMatchLock() internal {
        vm.warp(block.timestamp + 1 days + 1);
    }

    function _createContest() internal {
        contests.createContest(CONTEST_ID, MATCH_ID, ENTRY_FEE, MAX_ENTRIES_PER_CONTEST, MAX_ENTRIES_PER_WALLET);
    }

    function _createContest(uint256 contestId, uint256 matchId, uint16 maxEntries) internal {
        contests.createContest(contestId, matchId, ENTRY_FEE, maxEntries, MAX_ENTRIES_PER_WALLET);
    }

    function _playerPool()
        internal
        pure
        returns (uint16[] memory playerIds, uint8[] memory roles, uint8[] memory teamSides)
    {
        playerIds = new uint16[](22);
        roles = new uint8[](22);
        teamSides = new uint8[](22);

        uint8[22] memory roleValues = [
            uint8(RoleType.WK),
            uint8(RoleType.BAT),
            uint8(RoleType.BAT),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.WK),
            uint8(RoleType.WK),
            uint8(RoleType.BAT),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.BAT),
            uint8(RoleType.BOWL)
        ];
        uint8[22] memory sideValues = [
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE
        ];

        for (uint16 i = 0; i < 22; ++i) {
            playerIds[i] = i + 1;
            roles[i] = roleValues[i];
            teamSides[i] = sideValues[i];
        }
    }

    function _validSquad() internal pure returns (uint16[11] memory squad) {
        squad = [uint16(1), 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }

    function _alternateSquad() internal pure returns (uint16[11] memory squad) {
        squad = [uint16(1), 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    }

    function _higherSquad() internal pure returns (uint16[11] memory squad) {
        squad = [uint16(1), 2, 3, 4, 5, 6, 7, 8, 9, 10, 13];
    }

    function _invalidCompositionSquad() internal pure returns (uint16[11] memory squad) {
        squad = [uint16(1), 2, 3, 4, 6, 7, 8, 9, 13, 14, 16];
    }

    function _tooManyHomeSquad() internal pure returns (uint16[11] memory squad) {
        squad = [uint16(1), 2, 3, 4, 5, 6, 12, 13, 16, 7, 8];
    }

    function _submitLinearStats(uint256 matchId) internal {
        if (!registry.isLocked(matchId)) {
            _warpPastMatchLock();
        }
        (uint16[] memory playerIds,,) = _playerPool();
        PlayerStats[] memory stats = new PlayerStats[](playerIds.length);
        for (uint256 i = 0; i < playerIds.length; ++i) {
            stats[i].runs = playerIds[i];
            stats[i].inStartingXI = true;
        }

        vm.prank(publisher);
        scores.submitMatchStats(matchId, playerIds, stats);
    }

    function _join(address user, uint16[11] memory squad) internal returns (uint256 tokenId) {
        vm.prank(user);
        tokenId = contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, squad[0], squad[1]);
    }

    function _join(uint256 contestId, address user, uint16[11] memory squad) internal returns (uint256 tokenId) {
        vm.prank(user);
        tokenId = contests.joinContest{value: ENTRY_FEE}(contestId, squad, squad[0], squad[1]);
    }

    function _finalizeHappyPath() internal {
        _join(alice, _validSquad());
        vm.warp(block.timestamp + 1);
        _join(bob, _alternateSquad());
        vm.warp(block.timestamp + 1);
        _join(carol, _higherSquad());
        _submitLinearStats(MATCH_ID);
        contests.finalizeContest(CONTEST_ID);
    }
}
