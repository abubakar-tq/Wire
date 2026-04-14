// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {ContestManager} from "../src/ContestManager.sol";
import {FantasyTeamNFT} from "../src/FantasyTeamNFT.sol";
import {IFantasyTeamNFT} from "../src/interfaces/IFantasyTeamNFT.sol";
import {ILegacyPassport} from "../src/interfaces/ILegacyPassport.sol";
import {IMatchRegistry} from "../src/interfaces/IMatchRegistry.sol";
import {IScoreManager} from "../src/interfaces/IScoreManager.sol";
import {LegacyPassport} from "../src/LegacyPassport.sol";
import {MatchRegistry} from "../src/MatchRegistry.sol";
import {ScoreManager} from "../src/ScoreManager.sol";

contract DeployScript is Script {
    function run() external {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        vm.startBroadcast(privateKey);

        MatchRegistry registry = new MatchRegistry();
        FantasyTeamNFT teamNft = new FantasyTeamNFT(IMatchRegistry(address(registry)));
        ScoreManager scores = new ScoreManager(IMatchRegistry(address(registry)));
        LegacyPassport passport = new LegacyPassport();
        ContestManager contests = new ContestManager(
            IMatchRegistry(address(registry)),
            IFantasyTeamNFT(address(teamNft)),
            IScoreManager(address(scores)),
            ILegacyPassport(address(passport))
        );

        teamNft.grantRole(teamNft.MINTER_ROLE(), address(contests));
        passport.grantRole(passport.MINTER_ROLE(), address(contests));
        passport.grantRole(passport.RECORDER_ROLE(), address(contests));
        registry.grantRole(registry.STATUS_UPDATER_ROLE(), address(scores));
        registry.grantRole(registry.STATUS_UPDATER_ROLE(), address(contests));
        scores.grantRole(scores.SCORE_PUBLISHER_ROLE(), deployer);

        vm.stopBroadcast();

        console2.log("MatchRegistry:", address(registry));
        console2.log("FantasyTeamNFT:", address(teamNft));
        console2.log("ScoreManager:", address(scores));
        console2.log("LegacyPassport:", address(passport));
        console2.log("ContestManager:", address(contests));
        console2.log("Initial admin/operator/publisher:", deployer);
    }
}
