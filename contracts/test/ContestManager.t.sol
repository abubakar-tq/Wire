// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {FantasyArenaTestBase} from "./FantasyArenaTestBase.sol";
import {ContestManager} from "../src/ContestManager.sol";
import {IFantasyTeamNFT} from "../src/interfaces/IFantasyTeamNFT.sol";
import {ILegacyPassport} from "../src/interfaces/ILegacyPassport.sol";
import {IMatchRegistry} from "../src/interfaces/IMatchRegistry.sol";
import {IScoreManager} from "../src/interfaces/IScoreManager.sol";
import {Vm} from "forge-std/Vm.sol";
import {
    ContestAlreadyExists,
    ContestFull,
    InvalidContestConfig,
    MatchAlreadyHasContest,
    MatchLocked,
    NoRefund,
    NoReward,
    NotEnoughEntries,
    StatsNotSubmitted,
    WalletEntryLimitReached,
    WrongEntryFee
} from "../src/errors/Errors.sol";
import {Contest, Entry, MatchStatus, PlayerStats} from "../src/types/Structs.sol";

contract ContestManagerTest is FantasyArenaTestBase {
    bytes32 private constant ENTRY_SCORE_COMPUTED_TOPIC =
        keccak256("EntryScoreComputed(uint256,uint256,address,uint16,uint256,int32)");
    bytes32 private constant CONTEST_WINNER_RECORDED_TOPIC =
        keccak256("ContestWinnerRecorded(uint256,uint256,address,uint8,uint16,uint256,int32,uint256)");
    bytes32 private constant CONTEST_FINALIZED_TOPIC =
        keccak256("ContestFinalized(uint256,uint256,uint16[3],uint256[3],uint16,uint256,uint256,address)");
    bytes32 private constant REFUND_CREDITED_TOPIC =
        keccak256("RefundCredited(uint256,uint256,address,uint256,uint16,uint256,uint256)");
    bytes32 private constant CONTEST_CANCELLED_TOPIC =
        keccak256("ContestCancelled(uint256,uint256,uint256,uint256,address)");
    bytes32 private constant TREASURY_ACCRUED_TOPIC = keccak256("TreasuryAccrued(uint256,uint256,uint256,uint256)");
    bytes32 private constant TREASURY_UPDATED_TOPIC = keccak256("TreasuryUpdated(address,address,address)");

    function testConstructorEmitsInitialTreasuryState() public {
        vm.recordLogs();
        new ContestManager(
            IMatchRegistry(address(registry)),
            IFantasyTeamNFT(address(nft)),
            IScoreManager(address(scores)),
            ILegacyPassport(address(passport))
        );
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(_countLogsByTopic(logs, TREASURY_UPDATED_TOPIC), 1);
    }

    function testCreateContestSuccess() public {
        _createMatchWithPlayers();
        _createContest();

        Contest memory contest = contests.getContest(CONTEST_ID);
        assertEq(contest.matchId, MATCH_ID);
        assertEq(contest.entryFee, ENTRY_FEE);
        assertEq(contest.maxEntries, 25);
        assertEq(contest.maxEntriesPerWallet, 3);
        assertTrue(contest.exists);
        assertEq(contests.contestIdByMatch(MATCH_ID), CONTEST_ID);
    }

    function testRejectDuplicateContestAndSecondContestForMatch() public {
        _createMatchWithPlayers();
        _createContest();

        vm.expectRevert(ContestAlreadyExists.selector);
        contests.createContest(CONTEST_ID, MATCH_ID, ENTRY_FEE, 25, 3);

        vm.expectRevert(abi.encodeWithSelector(MatchAlreadyHasContest.selector, MATCH_ID, CONTEST_ID));
        contests.createContest(101, MATCH_ID, ENTRY_FEE, 25, 3);
    }

    function testRejectContestCreationBeforePlayersSeeded() public {
        _createMatch();

        vm.expectRevert(InvalidContestConfig.selector);
        _createContest();
    }

    function testJoinContestSuccessAndMintsNFT() public {
        _createMatchWithPlayers();
        _createContest();

        uint256 tokenId = _join(alice, _validSquad());
        Contest memory contest = contests.getContest(CONTEST_ID);

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), alice);
        assertEq(contest.totalEntries, 1);
        assertEq(contests.entriesByWallet(CONTEST_ID, alice), 1);
        assertTrue(contests.tokenEntered(CONTEST_ID, tokenId));
    }

    function testRejectWrongFee() public {
        _createMatchWithPlayers();
        _createContest();
        uint16[11] memory squad = _validSquad();

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(WrongEntryFee.selector, ENTRY_FEE, ENTRY_FEE - 1));
        contests.joinContest{value: ENTRY_FEE - 1}(CONTEST_ID, squad, squad[0], squad[1]);
    }

    function testRejectContestFull() public {
        _createMatchWithPlayers();
        contests.createContest(101, MATCH_ID, ENTRY_FEE, 3, 3);

        _join(101, alice, _validSquad());
        _join(101, bob, _alternateSquad());
        _join(101, carol, _higherSquad());

        vm.prank(dave);
        vm.expectRevert(ContestFull.selector);
        contests.joinContest{value: ENTRY_FEE}(101, _validSquad(), 1, 2);
    }

    function testEnforceMaxThreeEntriesPerWallet() public {
        _createMatchWithPlayers();
        _createContest();

        _join(alice, _validSquad());
        _join(alice, _alternateSquad());
        _join(alice, _higherSquad());

        vm.prank(alice);
        vm.expectRevert(WalletEntryLimitReached.selector);
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, _validSquad(), 1, 2);
    }

    function testRejectJoinAfterMatchLock() public {
        _createMatchWithPlayers();
        _createContest();
        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MatchLocked.selector, MATCH_ID));
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, _validSquad(), 1, 2);
    }

    function testFinalizeOnlyAfterStatsSubmitted() public {
        _createMatchWithPlayers();
        _createContest();
        _join(alice, _validSquad());
        _join(bob, _alternateSquad());
        _join(carol, _higherSquad());

        vm.expectRevert(abi.encodeWithSelector(StatsNotSubmitted.selector, MATCH_ID));
        contests.finalizeContest(CONTEST_ID);
    }

    function testRejectFinalizeWithFewerThanThreeEntries() public {
        _createMatchWithPlayers();
        _createContest();
        _join(alice, _validSquad());
        _join(bob, _alternateSquad());
        _submitLinearStats(MATCH_ID);

        vm.expectRevert(NotEnoughEntries.selector);
        contests.finalizeContest(CONTEST_ID);
    }

    function testComputeTeamScoreAndFinalizeRewards() public {
        _createMatchWithPlayers();
        _createContest();
        uint256 aliceToken = _join(alice, _validSquad());
        _join(bob, _alternateSquad());
        _join(carol, _higherSquad());
        _submitLinearStats(MATCH_ID);

        assertEq(contests.previewSquadScore(MATCH_ID, aliceToken), int32(118));
        contests.finalizeContest(CONTEST_ID);

        (uint16[3] memory winnerIndexes, uint256[3] memory rewards) = contests.getWinners(CONTEST_ID);
        assertEq(winnerIndexes[0], 2);
        assertEq(winnerIndexes[1], 1);
        assertEq(winnerIndexes[2], 0);
        assertEq(rewards[0], 1.35 ether);
        assertEq(rewards[1], 0.81 ether);
        assertEq(rewards[2], 0.54 ether);
        assertEq(contests.treasuryClaimable(), 0.3 ether);
        assertEq(contests.claimableRewards(carol), 1.35 ether);
        assertEq(uint8(registry.getMatch(MATCH_ID).status), uint8(MatchStatus.Finalized));
    }

    function testViceCaptainNegativeOddScoreRoundsDown() public {
        _createMatchWithPlayers();
        _createContest();
        uint256 aliceToken = _join(alice, _validSquad());
        _warpPastMatchLock();
        (uint16[] memory playerIds,,) = _playerPool();
        PlayerStats[] memory stats = new PlayerStats[](playerIds.length);
        stats[1].runs = 1;
        stats[1].duck = true;

        vm.prank(publisher);
        scores.submitMatchStats(MATCH_ID, playerIds, stats);

        assertEq(contests.previewSquadScore(MATCH_ID, aliceToken), int32(-2));
    }

    function testFinalizeEmitsIndexerEvents() public {
        _createMatchWithPlayers();
        _createContest();
        _join(alice, _validSquad());
        _join(bob, _alternateSquad());
        _join(carol, _higherSquad());
        _submitLinearStats(MATCH_ID);

        vm.recordLogs();
        contests.finalizeContest(CONTEST_ID);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(_countLogsByTopic(logs, ENTRY_SCORE_COMPUTED_TOPIC), 3);
        assertEq(_countLogsByTopic(logs, CONTEST_WINNER_RECORDED_TOPIC), 3);
        assertEq(_countLogsByTopic(logs, TREASURY_ACCRUED_TOPIC), 1);
        assertEq(_countLogsByTopic(logs, CONTEST_FINALIZED_TOPIC), 1);
    }

    function testTieBreakerBehavior() public {
        _createMatchWithPlayers();
        _createContest();
        _join(alice, _validSquad());
        vm.warp(block.timestamp + 1);
        _join(bob, _validSquad());
        vm.warp(block.timestamp + 1);
        _join(carol, _validSquad());
        _submitLinearStats(MATCH_ID);

        contests.finalizeContest(CONTEST_ID);
        (uint16[3] memory winnerIndexes,) = contests.getWinners(CONTEST_ID);
        assertEq(winnerIndexes[0], 0);
        assertEq(winnerIndexes[1], 1);
        assertEq(winnerIndexes[2], 2);
    }

    function testClaimRewardSuccessAndDoubleClaimImpossible() public {
        _createMatchWithPlayers();
        _createContest();
        _finalizeHappyPath();

        uint256 beforeBalance = carol.balance;
        vm.prank(carol);
        contests.claimReward();
        assertEq(carol.balance, beforeBalance + 1.35 ether);

        vm.prank(carol);
        vm.expectRevert(NoReward.selector);
        contests.claimReward();
    }

    function testCancelContestAndRefundClaims() public {
        _createMatchWithPlayers();
        _createContest();
        _join(alice, _validSquad());
        _join(bob, _alternateSquad());

        contests.cancelContest(CONTEST_ID);
        assertEq(contests.refundableEntries(alice), ENTRY_FEE);
        assertEq(contests.refundableEntries(bob), ENTRY_FEE);
        assertEq(uint8(registry.getMatch(MATCH_ID).status), uint8(MatchStatus.Cancelled));

        uint256 beforeBalance = alice.balance;
        vm.prank(alice);
        contests.claimRefund();
        assertEq(alice.balance, beforeBalance + ENTRY_FEE);

        vm.prank(alice);
        vm.expectRevert(NoRefund.selector);
        contests.claimRefund();
    }

    function testCancelEmitsRefundIndexerEvents() public {
        _createMatchWithPlayers();
        _createContest();
        _join(alice, _validSquad());
        _join(bob, _alternateSquad());

        vm.recordLogs();
        contests.cancelContest(CONTEST_ID);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(_countLogsByTopic(logs, REFUND_CREDITED_TOPIC), 2);
        assertEq(_countLogsByTopic(logs, CONTEST_CANCELLED_TOPIC), 1);
    }

    function testClaimTreasury() public {
        _createMatchWithPlayers();
        _createContest();
        _finalizeHappyPath();

        uint256 beforeBalance = treasury.balance;
        vm.prank(treasury);
        contests.claimTreasury();
        assertEq(treasury.balance, beforeBalance + 0.3 ether);
        assertEq(contests.treasuryClaimable(), 0);
    }

    function testFinalizedEntriesStoreScores() public {
        _createMatchWithPlayers();
        _createContest();
        _finalizeHappyPath();

        Entry memory entry = contests.getEntry(CONTEST_ID, 0);
        assertEq(entry.score, int32(118));
    }

    function _countLogsByTopic(Vm.Log[] memory logs, bytes32 topic0) private pure returns (uint256 count) {
        for (uint256 i = 0; i < logs.length; ++i) {
            if (logs[i].topics[0] == topic0) {
                ++count;
            }
        }
    }
}
