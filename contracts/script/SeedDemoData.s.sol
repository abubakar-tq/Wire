// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {ContestManager} from "../src/ContestManager.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";
import {AWAY_TEAM_SIDE, HOME_TEAM_SIDE, RoleType} from "../src/types/Structs.sol";

contract SeedDemoDataScript is Script {
    bytes32 private constant HOME_TEAM = 0x574952455f484f4d450000000000000000000000000000000000000000000000;
    bytes32 private constant AWAY_TEAM = 0x574952455f415741590000000000000000000000000000000000000000000000;

    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        MatchRegistry registry = MatchRegistry(vm.envAddress("MATCH_REGISTRY"));
        ContestManager contests = ContestManager(vm.envAddress("CONTEST_MANAGER"));

        uint256 matchId = vm.envOr("DEMO_MATCH_ID", uint256(2026041301));
        uint256 contestId = vm.envOr("DEMO_CONTEST_ID", uint256(202604130100));
        uint96 entryFee = uint96(vm.envOr("DEMO_ENTRY_FEE", uint256(0.01 ether)));
        uint64 lockTime = uint64(block.timestamp + vm.envOr("DEMO_LOCK_OFFSET", uint256(1 days)));
        uint64 startTime = uint64(block.timestamp + vm.envOr("DEMO_START_OFFSET", uint256(2 days)));

        (uint16[] memory playerIds, uint8[] memory roles, uint8[] memory teamSides) = _playerPool();

        vm.startBroadcast(privateKey);

        registry.createMatch(matchId, HOME_TEAM, AWAY_TEAM, startTime, lockTime);
        registry.setMatchPlayers(matchId, playerIds, roles, teamSides);
        contests.createContest(contestId, matchId, entryFee, 25, 3);

        vm.stopBroadcast();

        console2.log("Demo match:", matchId);
        console2.log("Demo contest:", contestId);
        console2.log("Entry fee:", entryFee);
    }

    function _playerPool()
        private
        pure
        returns (uint16[] memory playerIds, uint8[] memory roles, uint8[] memory teamSides)
    {
        playerIds = new uint16[](22);
        roles = new uint8[](22);
        teamSides = new uint8[](22);

        uint8[22] memory roleValues = [
            uint8(RoleType.WK),
            uint8(RoleType.BAT),
            uint8(RoleType.BAT),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.WK),
            uint8(RoleType.WK),
            uint8(RoleType.BAT),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BOWL),
            uint8(RoleType.BAT),
            uint8(RoleType.AR),
            uint8(RoleType.BAT),
            uint8(RoleType.BOWL)
        ];
        uint8[22] memory sideValues = [
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            AWAY_TEAM_SIDE,
            HOME_TEAM_SIDE,
            HOME_TEAM_SIDE
        ];

        for (uint16 i = 0; i < 22; ++i) {
            playerIds[i] = i + 1;
            roles[i] = roleValues[i];
            teamSides[i] = sideValues[i];
        }
    }
}
