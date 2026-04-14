// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {LegacyStats} from "../types/Structs.sol";

interface ILegacyPassport {
    function mintPassport(address to) external returns (uint256 tokenId);
    function mintIfNeeded(address to) external returns (uint256 tokenId);
    function recordEntry(address user) external;
    function recordWin(address user) external;
    function recordRewardClaim(address user, uint256 amount) external;
    function hasPassport(address user) external view returns (bool);
    function passportOf(address user) external view returns (uint256);
    function getStats(address user) external view returns (LegacyStats memory);
}
