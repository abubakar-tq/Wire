// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {FantasyArenaTestBase} from "./FantasyArenaTestBase.sol";
import {Entry, MatchStatus} from "../src/types/Structs.sol";

contract IntegrationTest is FantasyArenaTestBase {
    function testFullContestLifecycleWithClaims() public {
        _createMatchWithPlayers();
        _createContest();

        _join(alice, _validSquad());
        _join(alice, _alternateSquad());
        _join(bob, _validSquad());
        _join(carol, _higherSquad());

        _submitLinearStats(MATCH_ID);
        contests.finalizeContest(CONTEST_ID);

        Entry[] memory entries = contests.getContestEntries(CONTEST_ID);
        assertEq(entries.length, 4);
        assertEq(entries[0].score, int32(118));
        assertEq(entries[1].score, int32(119));
        assertEq(entries[2].score, int32(118));
        assertEq(entries[3].score, int32(120));

        (uint16[3] memory winnerIndexes, uint256[3] memory rewards) = contests.getWinners(CONTEST_ID);
        assertEq(winnerIndexes[0], 3);
        assertEq(winnerIndexes[1], 1);
        assertEq(winnerIndexes[2], 0);
        assertEq(rewards[0], 1.8 ether);
        assertEq(rewards[1], 1.08 ether);
        assertEq(rewards[2], 0.72 ether);
        assertEq(contests.treasuryClaimable(), 0.4 ether);
        assertEq(uint8(registry.getMatch(MATCH_ID).status), uint8(MatchStatus.Finalized));

        uint256 carolBefore = carol.balance;
        vm.prank(carol);
        contests.claimReward();
        assertEq(carol.balance, carolBefore + 1.8 ether);

        uint256 aliceBefore = alice.balance;
        vm.prank(alice);
        contests.claimReward();
        assertEq(alice.balance, aliceBefore + 1.8 ether);

        uint256 treasuryBefore = treasury.balance;
        vm.prank(treasury);
        contests.claimTreasury();
        assertEq(treasury.balance, treasuryBefore + 0.4 ether);
    }
}
