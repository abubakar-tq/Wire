// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {MatchInfo, MatchStatus, PlayerMeta} from "../types/Structs.sol";

interface IMatchRegistry {
    function updateMatchStatus(uint256 matchId, MatchStatus newStatus) external;
    function isLocked(uint256 matchId) external view returns (bool);
    function isPlayerAllowed(uint256 matchId, uint16 playerId) external view returns (bool);
    function getPlayerMeta(uint256 matchId, uint16 playerId) external view returns (PlayerMeta memory);
    function getMatch(uint256 matchId) external view returns (MatchInfo memory);
    function getMatchPlayerIds(uint256 matchId) external view returns (uint16[] memory);
}
