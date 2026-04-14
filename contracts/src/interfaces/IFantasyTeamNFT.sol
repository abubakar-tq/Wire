// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Squad} from "../types/Structs.sol";

interface IFantasyTeamNFT {
    function mintSquad(
        address to,
        uint256 matchId,
        uint16[11] calldata playerIds,
        uint16 captainId,
        uint16 viceCaptainId
    ) external returns (uint256 tokenId);

    function updateSquad(uint256 tokenId, uint16[11] calldata playerIds, uint16 captainId, uint16 viceCaptainId)
        external;

    function getSquad(uint256 tokenId) external view returns (Squad memory);
    function squadMatchId(uint256 tokenId) external view returns (uint256);
    function isSquadLocked(uint256 tokenId) external view returns (bool);
    function isTransferLocked(uint256 tokenId) external view returns (bool);
}
