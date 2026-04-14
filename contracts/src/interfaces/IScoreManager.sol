// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PlayerStats} from "../types/Structs.sol";

interface IScoreManager {
    function submitMatchStats(uint256 matchId, uint16[] calldata playerIds, PlayerStats[] calldata stats) external;
    function getPlayerPoints(uint256 matchId, uint16 playerId) external view returns (int32);
    function getPlayerStats(uint256 matchId, uint16 playerId) external view returns (PlayerStats memory);
    function hasStats(uint256 matchId) external view returns (bool);
}
