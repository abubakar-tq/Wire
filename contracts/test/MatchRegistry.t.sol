// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {FantasyArenaTestBase} from "./FantasyArenaTestBase.sol";
import {
    DuplicatePlayer,
    InvalidArrayLength,
    InvalidMatchTiming,
    InvalidPlayerRole,
    InvalidStatusTransition,
    InvalidTeamSide,
    MatchAlreadyExists,
    MatchLocked,
    PlayerPoolFrozen
} from "../src/errors/Errors.sol";
import {MatchInfo, MatchStatus, PlayerMeta, RoleType} from "../src/types/Structs.sol";

contract MatchRegistryTest is FantasyArenaTestBase {
    function testCreateMatchSuccess() public {
        _createMatch();

        MatchInfo memory info = registry.getMatch(MATCH_ID);
        assertEq(info.startTime, uint64(block.timestamp + 2 days));
        assertEq(info.lockTime, uint64(block.timestamp + 1 days));
        assertEq(uint8(info.status), uint8(MatchStatus.Scheduled));
        assertTrue(info.exists);
    }

    function testDuplicateMatchReverts() public {
        _createMatch();

        vm.expectRevert(MatchAlreadyExists.selector);
        _createMatch();
    }

    function testInvalidTimingReverts() public {
        vm.expectRevert(InvalidMatchTiming.selector);
        registry.createMatch(
            MATCH_ID, HOME_TEAM, AWAY_TEAM, uint64(block.timestamp + 1 days), uint64(block.timestamp + 2 days)
        );
    }

    function testSetPlayersSuccess() public {
        _createMatch();
        _seedPlayers(MATCH_ID);

        uint16[] memory ids = registry.getMatchPlayerIds(MATCH_ID);
        assertEq(ids.length, 22);
        assertTrue(registry.isPlayerAllowed(MATCH_ID, 1));

        PlayerMeta memory meta = registry.getPlayerMeta(MATCH_ID, 1);
        assertEq(meta.playerId, 1);
        assertEq(meta.role, uint8(RoleType.WK));
        assertEq(meta.teamSide, 1);
        assertTrue(meta.allowed);
    }

    function testSetPlayersRejectsInvalidArrays() public {
        _createMatch();
        uint16[] memory ids = new uint16[](1);
        uint8[] memory roles = new uint8[](2);
        uint8[] memory sides = new uint8[](1);
        ids[0] = 1;
        roles[0] = uint8(RoleType.WK);
        roles[1] = uint8(RoleType.BAT);
        sides[0] = 1;

        vm.expectRevert(InvalidArrayLength.selector);
        registry.setMatchPlayers(MATCH_ID, ids, roles, sides);
    }

    function testSetPlayersRejectsInvalidMetadata() public {
        _createMatch();
        uint16[] memory ids = new uint16[](1);
        uint8[] memory roles = new uint8[](1);
        uint8[] memory sides = new uint8[](1);
        ids[0] = 1;
        roles[0] = 4;
        sides[0] = 1;

        vm.expectRevert(InvalidPlayerRole.selector);
        registry.setMatchPlayers(MATCH_ID, ids, roles, sides);

        roles[0] = uint8(RoleType.WK);
        sides[0] = 3;

        vm.expectRevert(InvalidTeamSide.selector);
        registry.setMatchPlayers(MATCH_ID, ids, roles, sides);
    }

    function testSetPlayersRejectsDuplicatePlayerIds() public {
        _createMatch();
        uint16[] memory ids = new uint16[](2);
        uint8[] memory roles = new uint8[](2);
        uint8[] memory sides = new uint8[](2);
        ids[0] = 1;
        ids[1] = 1;
        roles[0] = uint8(RoleType.WK);
        roles[1] = uint8(RoleType.BAT);
        sides[0] = 1;
        sides[1] = 2;

        vm.expectRevert(abi.encodeWithSelector(DuplicatePlayer.selector, uint16(1)));
        registry.setMatchPlayers(MATCH_ID, ids, roles, sides);
    }

    function testSetPlayersRevertsAfterLock() public {
        _createMatchWithPlayers();
        vm.warp(block.timestamp + 1 days + 1);
        (uint16[] memory ids, uint8[] memory roles, uint8[] memory sides) = _playerPool();

        vm.expectRevert(abi.encodeWithSelector(MatchLocked.selector, MATCH_ID));
        registry.setMatchPlayers(MATCH_ID, ids, roles, sides);
    }

    function testSetPlayersRevertsAfterPoolFrozen() public {
        _createMatchWithPlayers();
        registry.freezeMatchPlayers(MATCH_ID);
        (uint16[] memory ids, uint8[] memory roles, uint8[] memory sides) = _playerPool();

        vm.expectRevert(abi.encodeWithSelector(PlayerPoolFrozen.selector, MATCH_ID));
        registry.setMatchPlayers(MATCH_ID, ids, roles, sides);
    }

    function testIsLockedBehavior() public {
        _createMatch();
        assertFalse(registry.isLocked(MATCH_ID));

        vm.warp(block.timestamp + 1 days);
        assertTrue(registry.isLocked(MATCH_ID));
    }

    function testStatusTransitions() public {
        _createMatch();

        registry.updateMatchStatus(MATCH_ID, MatchStatus.Locked);
        MatchInfo memory info = registry.getMatch(MATCH_ID);
        assertEq(uint8(info.status), uint8(MatchStatus.Locked));

        vm.expectRevert(InvalidStatusTransition.selector);
        registry.updateMatchStatus(MATCH_ID, MatchStatus.Scheduled);
    }
}
