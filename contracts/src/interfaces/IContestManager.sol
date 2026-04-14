// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ILegacyPassport} from "./ILegacyPassport.sol";
import {Contest, Entry} from "../types/Structs.sol";

interface IContestManager {
    function legacyPassport() external view returns (ILegacyPassport);

    function createContest(
        uint256 contestId,
        uint256 matchId,
        uint96 entryFee,
        uint16 maxEntries,
        uint8 maxEntriesPerWallet
    ) external;

    function joinContest(uint256 contestId, uint16[11] calldata playerIds, uint16 captainId, uint16 viceCaptainId)
        external
        payable
        returns (uint256 tokenId);

    function finalizeContest(uint256 contestId) external;
    function cancelContest(uint256 contestId) external;
    function claimReward() external;
    function claimRefund() external;
    function claimTreasury() external;
    function getContest(uint256 contestId) external view returns (Contest memory);
    function getEntry(uint256 contestId, uint256 entryIndex) external view returns (Entry memory);
    function getContestEntries(uint256 contestId) external view returns (Entry[] memory);
    function getWinners(uint256 contestId) external view returns (uint16[3] memory, uint256[3] memory);
    function previewSquadScore(uint256 matchId, uint256 tokenId) external view returns (int32);
}
