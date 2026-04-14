// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {LegacyStats} from "./types/Structs.sol";
import {
    LegacyEntryRecorded,
    LegacyPassportBaseURIUpdated,
    LegacyPassportMinted,
    LegacyRewardRecorded,
    LegacyWinRecorded
} from "./events/Events.sol";
import {PassportAlreadyMinted, PassportNotFound, SoulboundTokenTransfer, ZeroAddress} from "./errors/Errors.sol";

contract LegacyPassport is ERC721, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");

    uint256 public nextTokenId = 1;

    string private _baseTokenUri;
    mapping(address => uint256) private _passportOf;
    mapping(uint256 => LegacyStats) private _statsByTokenId;

    constructor() ERC721("WireFluid Legacy Passport", "WLP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function mintPassport(address to) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (_passportOf[to] != 0) revert PassportAlreadyMinted(to);
        tokenId = _mintPassport(to);
    }

    function mintIfNeeded(address to) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert ZeroAddress();
        tokenId = _passportOf[to];
        if (tokenId == 0) {
            tokenId = _mintPassport(to);
        }
    }

    function recordEntry(address user) external onlyRole(RECORDER_ROLE) {
        uint256 tokenId = _requirePassport(user);
        LegacyStats storage stats = _statsByTokenId[tokenId];
        if (stats.firstJoinedAt == 0) {
            stats.firstJoinedAt = uint64(block.timestamp);
        }
        stats.lastActiveAt = uint64(block.timestamp);
        ++stats.contestsEntered;

        emit LegacyEntryRecorded(user, tokenId, stats.contestsEntered);
    }

    function recordWin(address user) external onlyRole(RECORDER_ROLE) {
        uint256 tokenId = _requirePassport(user);
        LegacyStats storage stats = _statsByTokenId[tokenId];
        stats.lastActiveAt = uint64(block.timestamp);
        ++stats.contestsWon;

        emit LegacyWinRecorded(user, tokenId, stats.contestsWon);
    }

    function recordRewardClaim(address user, uint256 amount) external onlyRole(RECORDER_ROLE) {
        uint256 tokenId = _requirePassport(user);
        LegacyStats storage stats = _statsByTokenId[tokenId];
        stats.lastActiveAt = uint64(block.timestamp);
        stats.totalRewardsClaimed += amount;

        emit LegacyRewardRecorded(user, tokenId, amount, stats.totalRewardsClaimed);
    }

    function setBaseURI(string calldata baseUri_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenUri = baseUri_;
        emit LegacyPassportBaseURIUpdated(baseUri_);
    }

    function hasPassport(address user) external view returns (bool) {
        return _passportOf[user] != 0;
    }

    function passportOf(address user) external view returns (uint256) {
        uint256 tokenId = _passportOf[user];
        if (tokenId == 0) revert PassportNotFound(user);
        return tokenId;
    }

    function getStats(address user) external view returns (LegacyStats memory) {
        uint256 tokenId = _requirePassport(user);
        return _statsByTokenId[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return bytes(_baseTokenUri).length == 0 ? "" : string.concat(_baseTokenUri, tokenId.toString());
    }

    function approve(address, uint256 tokenId) public pure override {
        revert SoulboundTokenTransfer(tokenId);
    }

    function setApprovalForAll(address, bool) public pure override {
        revert SoulboundTokenTransfer(0);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) revert SoulboundTokenTransfer(tokenId);
        return super._update(to, tokenId, auth);
    }

    function _mintPassport(address to) private returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _passportOf[to] = tokenId;
        _mint(to, tokenId);

        emit LegacyPassportMinted(to, tokenId);
    }

    function _requirePassport(address user) private view returns (uint256 tokenId) {
        tokenId = _passportOf[user];
        if (tokenId == 0) revert PassportNotFound(user);
    }
}
