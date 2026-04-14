// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {console2} from "forge-std/Script.sol";
import {ContestManager} from "../src/ContestManager.sol";
import {FantasyTeamNFT} from "../src/FantasyTeamNFT.sol";
import {LegacyPassport} from "../src/LegacyPassport.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";
import {ScoreManager} from "../src/ScoreManager.sol";
import {DeploymentReader} from "./DeploymentReader.s.sol";

contract GrantRolesScript is DeploymentReader {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        MatchRegistry registry = MatchRegistry(_envOrDeploymentAddress("MATCH_REGISTRY", "matchRegistry"));
        FantasyTeamNFT teamNft = FantasyTeamNFT(_envOrDeploymentAddress("FANTASY_TEAM_NFT", "fantasyTeamNft"));
        ScoreManager scores = ScoreManager(_envOrDeploymentAddress("SCORE_MANAGER", "scoreManager"));
        LegacyPassport passport = LegacyPassport(_envOrDeploymentAddress("LEGACY_PASSPORT", "legacyPassport"));
        ContestManager contests = ContestManager(_envOrDeploymentAddress("CONTEST_MANAGER", "contestManager"));

        address operator = vm.envOr("OPERATOR_ADDRESS", deployer);
        address publisher = vm.envOr("SCORE_PUBLISHER", deployer);
        address treasury = vm.envOr("TREASURY_ADDRESS", deployer);

        vm.startBroadcast(privateKey);

        teamNft.grantRole(teamNft.MINTER_ROLE(), address(contests));
        passport.grantRole(passport.MINTER_ROLE(), address(contests));
        passport.grantRole(passport.RECORDER_ROLE(), address(contests));
        scores.grantRole(scores.SCORE_PUBLISHER_ROLE(), publisher);
        registry.grantRole(registry.OPERATOR_ROLE(), operator);
        registry.grantRole(registry.STATUS_UPDATER_ROLE(), address(scores));
        registry.grantRole(registry.STATUS_UPDATER_ROLE(), address(contests));
        contests.grantRole(contests.OPERATOR_ROLE(), operator);
        contests.setTreasury(treasury);

        vm.stopBroadcast();

        console2.log("Operator:", operator);
        console2.log("Score publisher:", publisher);
        console2.log("Treasury:", treasury);
    }
}
