// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {FantasyArenaTestBase} from "./FantasyArenaTestBase.sol";
import {
    CaptainNotInSquad,
    CaptainViceCaptainSame,
    DuplicatePlayer,
    InvalidSquadComposition,
    MatchLocked,
    NotTokenOwner,
    TokenTransferLocked,
    ViceCaptainNotInSquad
} from "../src/errors/Errors.sol";
import {Squad} from "../src/types/Structs.sol";

contract FantasyTeamNFTTest is FantasyArenaTestBase {
    function testMintValidSquad() public {
        _createMatchWithPlayers();
        _createContest();

        uint256 tokenId = _join(alice, _validSquad());
        assertEq(nft.ownerOf(tokenId), alice);

        Squad memory squad = nft.getSquad(tokenId);
        assertEq(squad.matchId, MATCH_ID);
        assertEq(squad.captainId, 1);
        assertEq(squad.viceCaptainId, 2);
        assertTrue(squad.exists);
    }

    function testRejectDuplicatePlayers() public {
        _createMatchWithPlayers();
        _createContest();
        uint16[11] memory squad = _validSquad();
        squad[10] = 1;

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(DuplicatePlayer.selector, uint16(1)));
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, squad[0], squad[1]);
    }

    function testRejectInvalidCaptainAndViceCaptain() public {
        _createMatchWithPlayers();
        _createContest();
        uint16[11] memory squad = _validSquad();

        vm.prank(alice);
        vm.expectRevert(CaptainNotInSquad.selector);
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, 22, squad[1]);

        vm.prank(alice);
        vm.expectRevert(ViceCaptainNotInSquad.selector);
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, squad[0], 22);

        vm.prank(alice);
        vm.expectRevert(CaptainViceCaptainSame.selector);
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, squad[0], squad[0]);
    }

    function testRejectInvalidRoleComposition() public {
        _createMatchWithPlayers();
        _createContest();
        uint16[11] memory squad = _invalidCompositionSquad();

        vm.prank(alice);
        vm.expectRevert(InvalidSquadComposition.selector);
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, squad[0], squad[1]);
    }

    function testRejectMoreThanSevenFromSameSide() public {
        _createMatchWithPlayers();
        _createContest();
        uint16[11] memory squad = _tooManyHomeSquad();

        vm.prank(alice);
        vm.expectRevert(InvalidSquadComposition.selector);
        contests.joinContest{value: ENTRY_FEE}(CONTEST_ID, squad, squad[0], squad[1]);
    }

    function testAllowUpdateBeforeLock() public {
        _createMatchWithPlayers();
        _createContest();
        uint256 tokenId = _join(alice, _validSquad());

        uint16[11] memory updated = _alternateSquad();
        vm.prank(alice);
        nft.updateSquad(tokenId, updated, updated[0], updated[1]);

        Squad memory squad = nft.getSquad(tokenId);
        assertEq(squad.playerIds[10], 12);
    }

    function testRejectUpdateAfterLock() public {
        _createMatchWithPlayers();
        _createContest();
        uint256 tokenId = _join(alice, _validSquad());
        vm.warp(block.timestamp + 1 days + 1);

        uint16[11] memory updated = _alternateSquad();
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(MatchLocked.selector, MATCH_ID));
        nft.updateSquad(tokenId, updated, updated[0], updated[1]);
    }

    function testOnlyOwnerCanUpdate() public {
        _createMatchWithPlayers();
        _createContest();
        uint256 tokenId = _join(alice, _validSquad());
        uint16[11] memory updated = _alternateSquad();

        vm.prank(bob);
        vm.expectRevert(NotTokenOwner.selector);
        nft.updateSquad(tokenId, updated, updated[0], updated[1]);
    }

    function testTransferBlockedUntilFinalized() public {
        _createMatchWithPlayers();
        _createContest();
        uint256 tokenId = _join(alice, _validSquad());

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(TokenTransferLocked.selector, tokenId));
        nft.transferFrom(alice, bob, tokenId);

        vm.warp(block.timestamp + 1);
        _join(bob, _alternateSquad());
        vm.warp(block.timestamp + 1);
        _join(carol, _higherSquad());
        _submitLinearStats(MATCH_ID);
        contests.finalizeContest(CONTEST_ID);

        vm.prank(alice);
        nft.transferFrom(alice, bob, tokenId);
        assertEq(nft.ownerOf(tokenId), bob);
    }
}
