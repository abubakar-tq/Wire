// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {PlayerStats} from "../types/Structs.sol";

library ScoringRules {
    function calculate(PlayerStats memory stats) internal pure returns (int32) {
        int256 points = int256(uint256(stats.runs));
        points += int256(uint256(stats.fours));
        points += int256(uint256(stats.sixes)) * 2;
        points += int256(uint256(stats.wickets)) * 25;
        points += int256(uint256(stats.maidens)) * 12;
        points += int256(uint256(stats.catches)) * 8;
        points += int256(uint256(stats.stumpings)) * 12;
        points += int256(uint256(stats.runOutDirect)) * 12;
        points += int256(uint256(stats.runOutIndirect)) * 6;

        if (stats.duck) {
            points -= 2;
        }
        if (stats.inStartingXI) {
            points += 4;
        }
        if (stats.substituteAppearance) {
            points += 2;
        }

        // Safe because all PlayerStats fields are capped at uint16/uint8 sizes.
        // forge-lint: disable-next-line(unsafe-typecast)
        return int32(points);
    }
}
