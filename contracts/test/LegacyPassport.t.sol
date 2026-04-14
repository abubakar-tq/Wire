// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {FantasyArenaTestBase} from "./FantasyArenaTestBase.sol";
import {PassportAlreadyMinted, PassportNotFound, SoulboundTokenTransfer} from "../src/errors/Errors.sol";
import {LegacyStats} from "../src/types/Structs.sol";

contract LegacyPassportTest is FantasyArenaTestBase {
    function testMintPassportSuccess() public {
        passport.grantRole(passport.MINTER_ROLE(), admin);

        uint256 tokenId = passport.mintPassport(alice);

        assertEq(tokenId, 1);
        assertEq(passport.ownerOf(tokenId), alice);
        assertTrue(passport.hasPassport(alice));
        assertEq(passport.passportOf(alice), tokenId);
    }

    function testRejectDuplicatePassport() public {
        passport.grantRole(passport.MINTER_ROLE(), admin);
        passport.mintPassport(alice);

        vm.expectRevert(abi.encodeWithSelector(PassportAlreadyMinted.selector, alice));
        passport.mintPassport(alice);
    }

    function testPassportOfMissingUserReverts() public {
        vm.expectRevert(abi.encodeWithSelector(PassportNotFound.selector, alice));
        passport.passportOf(alice);
    }

    function testSoulboundTransfersAndApprovalsRevert() public {
        passport.grantRole(passport.MINTER_ROLE(), admin);
        uint256 tokenId = passport.mintPassport(alice);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(SoulboundTokenTransfer.selector, tokenId));
        passport.transferFrom(alice, bob, tokenId);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(SoulboundTokenTransfer.selector, tokenId));
        passport.approve(bob, tokenId);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(SoulboundTokenTransfer.selector, uint256(0)));
        passport.setApprovalForAll(bob, true);
    }

    function testContestJoinAutoMintsAndRecordsEntry() public {
        _createMatchWithPlayers();
        _createContest();

        _join(alice, _validSquad());

        uint256 tokenId = passport.passportOf(alice);
        LegacyStats memory stats = passport.getStats(alice);

        assertEq(passport.ownerOf(tokenId), alice);
        assertEq(stats.contestsEntered, 1);
        assertEq(stats.contestsWon, 0);
        assertEq(stats.totalRewardsClaimed, 0);
        assertEq(stats.firstJoinedAt, uint64(block.timestamp));
        assertEq(stats.lastActiveAt, uint64(block.timestamp));
    }

    function testFinalizeAndClaimUpdateLegacyStats() public {
        _createMatchWithPlayers();
        _createContest();
        _finalizeHappyPath();

        LegacyStats memory winnerStats = passport.getStats(carol);
        assertEq(winnerStats.contestsEntered, 1);
        assertEq(winnerStats.contestsWon, 1);
        assertEq(winnerStats.totalRewardsClaimed, 0);

        vm.prank(carol);
        contests.claimReward();

        winnerStats = passport.getStats(carol);
        assertEq(winnerStats.totalRewardsClaimed, 1.35 ether);
    }
}
