// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {FantasyArenaTestBase} from "./FantasyArenaTestBase.sol";
import {DuplicatePlayer, InvalidArrayLength, PlayerNotAllowed, StatsAlreadySubmitted} from "../src/errors/Errors.sol";
import {MatchStatus, PlayerStats} from "../src/types/Structs.sol";

contract ScoreManagerTest is FantasyArenaTestBase {
    function testOnlyScorePublisherCanSubmit() public {
        _createMatchWithPlayers();
        uint16[] memory playerIds = new uint16[](1);
        PlayerStats[] memory stats = new PlayerStats[](1);
        playerIds[0] = 1;

        vm.expectRevert();
        scores.submitMatchStats(MATCH_ID, playerIds, stats);
    }

    function testRejectInvalidPlayerIds() public {
        _createMatchWithPlayers();
        uint16[] memory playerIds = new uint16[](1);
        PlayerStats[] memory stats = new PlayerStats[](1);
        playerIds[0] = 99;

        vm.prank(publisher);
        vm.expectRevert(abi.encodeWithSelector(PlayerNotAllowed.selector, MATCH_ID, uint16(99)));
        scores.submitMatchStats(MATCH_ID, playerIds, stats);
    }

    function testRejectLengthMismatch() public {
        _createMatchWithPlayers();
        uint16[] memory playerIds = new uint16[](2);
        PlayerStats[] memory stats = new PlayerStats[](1);
        playerIds[0] = 1;
        playerIds[1] = 2;

        vm.prank(publisher);
        vm.expectRevert(InvalidArrayLength.selector);
        scores.submitMatchStats(MATCH_ID, playerIds, stats);
    }

    function testRejectDuplicatePlayerStats() public {
        _createMatchWithPlayers();
        uint16[] memory playerIds = new uint16[](2);
        PlayerStats[] memory stats = new PlayerStats[](2);
        playerIds[0] = 1;
        playerIds[1] = 1;

        vm.prank(publisher);
        vm.expectRevert(abi.encodeWithSelector(DuplicatePlayer.selector, uint16(1)));
        scores.submitMatchStats(MATCH_ID, playerIds, stats);
    }

    function testComputeCorrectPlayerPoints() public {
        _createMatchWithPlayers();
        uint16[] memory playerIds = new uint16[](2);
        PlayerStats[] memory stats = new PlayerStats[](2);
        playerIds[0] = 1;
        stats[0] = PlayerStats({
            runs: 30,
            fours: 4,
            sixes: 2,
            wickets: 1,
            maidens: 1,
            catches: 1,
            stumpings: 1,
            runOutDirect: 1,
            runOutIndirect: 1,
            duck: false,
            inStartingXI: true,
            substituteAppearance: false
        });
        playerIds[1] = 2;
        stats[1].duck = true;

        vm.prank(publisher);
        scores.submitMatchStats(MATCH_ID, playerIds, stats);

        assertEq(scores.getPlayerPoints(MATCH_ID, 1), int32(117));
        assertEq(scores.getPlayerPoints(MATCH_ID, 2), int32(-2));
        assertTrue(scores.hasStats(MATCH_ID));
        assertEq(uint8(registry.getMatch(MATCH_ID).status), uint8(MatchStatus.StatsSubmitted));
    }

    function testRejectDoubleSubmit() public {
        _createMatchWithPlayers();
        _submitLinearStats(MATCH_ID);
        (uint16[] memory playerIds,,) = _playerPool();
        PlayerStats[] memory stats = new PlayerStats[](playerIds.length);

        vm.prank(publisher);
        vm.expectRevert(abi.encodeWithSelector(StatsAlreadySubmitted.selector, MATCH_ID));
        scores.submitMatchStats(MATCH_ID, playerIds, stats);
    }
}
