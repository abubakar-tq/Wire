// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IMatchRegistry} from "./interfaces/IMatchRegistry.sol";
import {AWAY_TEAM_SIDE, HOME_TEAM_SIDE, MatchInfo, MatchStatus, PlayerMeta, RoleType, Squad} from "./types/Structs.sol";
import {
    CaptainNotInSquad,
    CaptainViceCaptainSame,
    DuplicatePlayer,
    InvalidSquadComposition,
    MatchLocked,
    NotTokenOwner,
    PlayerNotAllowed,
    SquadNotFound,
    TokenTransferLocked,
    ViceCaptainNotInSquad,
    ZeroAddress
} from "./errors/Errors.sol";
import {BaseURIUpdated, SquadMinted, SquadUpdated} from "./events/Events.sol";

contract FantasyTeamNFT is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Public getter keeps the integration-facing name from the design.
    // forge-lint: disable-next-line(screaming-snake-case-immutable)
    IMatchRegistry public immutable matchRegistry;
    uint256 public nextTokenId = 1;

    string private _baseTokenUri;
    mapping(uint256 => Squad) private _squads;

    constructor(IMatchRegistry registry) ERC721("WireFluid Fantasy Squad", "WFS") {
        if (address(registry) == address(0)) revert ZeroAddress();
        matchRegistry = registry;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintSquad(
        address to,
        uint256 matchId,
        uint16[11] calldata playerIds,
        uint16 captainId,
        uint16 viceCaptainId
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        _validateSquad(matchId, playerIds, captainId, viceCaptainId);

        tokenId = nextTokenId++;
        _squads[tokenId] = Squad({
            matchId: matchId, playerIds: playerIds, captainId: captainId, viceCaptainId: viceCaptainId, exists: true
        });
        _safeMint(to, tokenId);

        emit SquadMinted(tokenId, to, matchId, playerIds, captainId, viceCaptainId);
    }

    function updateSquad(uint256 tokenId, uint16[11] calldata playerIds, uint16 captainId, uint16 viceCaptainId)
        external
    {
        Squad storage squad = _squads[tokenId];
        if (!squad.exists) revert SquadNotFound(tokenId);
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (matchRegistry.isLocked(squad.matchId)) revert MatchLocked(squad.matchId);

        _validateSquad(squad.matchId, playerIds, captainId, viceCaptainId);
        squad.playerIds = playerIds;
        squad.captainId = captainId;
        squad.viceCaptainId = viceCaptainId;

        emit SquadUpdated(tokenId, squad.matchId, playerIds, captainId, viceCaptainId);
    }

    function setBaseURI(string calldata baseUri_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenUri = baseUri_;
        emit BaseURIUpdated(baseUri_);
    }

    function getSquad(uint256 tokenId) external view returns (Squad memory) {
        Squad memory squad = _squads[tokenId];
        if (!squad.exists) revert SquadNotFound(tokenId);
        return squad;
    }

    function squadMatchId(uint256 tokenId) external view returns (uint256) {
        Squad memory squad = _squads[tokenId];
        if (!squad.exists) revert SquadNotFound(tokenId);
        return squad.matchId;
    }

    function isSquadLocked(uint256 tokenId) external view returns (bool) {
        Squad memory squad = _squads[tokenId];
        if (!squad.exists) revert SquadNotFound(tokenId);
        return matchRegistry.isLocked(squad.matchId);
    }

    function isTransferLocked(uint256 tokenId) public view returns (bool) {
        Squad memory squad = _squads[tokenId];
        if (!squad.exists) revert SquadNotFound(tokenId);
        MatchInfo memory info = matchRegistry.getMatch(squad.matchId);
        return info.status != MatchStatus.Finalized && info.status != MatchStatus.Cancelled;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return bytes(_baseTokenUri).length == 0 ? "" : string.concat(_baseTokenUri, tokenId.toString());
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0) && isTransferLocked(tokenId)) {
            revert TokenTransferLocked(tokenId);
        }
        return super._update(to, tokenId, auth);
    }

    function _validateSquad(uint256 matchId, uint16[11] calldata playerIds, uint16 captainId, uint16 viceCaptainId)
        private
        view
    {
        matchRegistry.getMatch(matchId);
        if (matchRegistry.isLocked(matchId)) revert MatchLocked(matchId);
        if (captainId == viceCaptainId) revert CaptainViceCaptainSame();

        bool captainFound;
        bool viceCaptainFound;
        uint8[4] memory roleCounts;
        uint8[3] memory sideCounts;

        for (uint256 i = 0; i < playerIds.length; ++i) {
            uint16 playerId = playerIds[i];
            if (!matchRegistry.isPlayerAllowed(matchId, playerId)) revert PlayerNotAllowed(matchId, playerId);

            for (uint256 j = 0; j < i; ++j) {
                if (playerIds[j] == playerId) revert DuplicatePlayer(playerId);
            }

            PlayerMeta memory meta = matchRegistry.getPlayerMeta(matchId, playerId);
            if (meta.role > uint8(RoleType.BOWL)) revert InvalidSquadComposition();
            ++roleCounts[meta.role];

            if (meta.teamSide == HOME_TEAM_SIDE) {
                ++sideCounts[HOME_TEAM_SIDE];
            } else if (meta.teamSide == AWAY_TEAM_SIDE) {
                ++sideCounts[AWAY_TEAM_SIDE];
            } else {
                revert InvalidSquadComposition();
            }

            if (playerId == captainId) captainFound = true;
            if (playerId == viceCaptainId) viceCaptainFound = true;
        }

        if (!captainFound) revert CaptainNotInSquad();
        if (!viceCaptainFound) revert ViceCaptainNotInSquad();
        if (
            roleCounts[uint8(RoleType.WK)] < 1 || roleCounts[uint8(RoleType.WK)] > 4
                || roleCounts[uint8(RoleType.BAT)] < 3 || roleCounts[uint8(RoleType.BAT)] > 6
                || roleCounts[uint8(RoleType.AR)] < 1 || roleCounts[uint8(RoleType.AR)] > 4
                || roleCounts[uint8(RoleType.BOWL)] < 3 || roleCounts[uint8(RoleType.BOWL)] > 6
                || sideCounts[HOME_TEAM_SIDE] > 7 || sideCounts[AWAY_TEAM_SIDE] > 7
        ) {
            revert InvalidSquadComposition();
        }
    }
}
