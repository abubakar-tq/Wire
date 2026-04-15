// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";
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
    using stdJson for string;

    function run() external {
        vm.startBroadcast();
        address deployer = msg.sender;

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

        _writeDeploymentJson(
            deployer,
            address(registry),
            address(teamNft),
            address(scores),
            address(passport),
            address(contests)
        );
    }

    function _writeDeploymentJson(
        address deployer,
        address registry,
        address teamNft,
        address scores,
        address passport,
        address contests
    ) private {
        string memory contractsJson = "contracts";
        contractsJson.serialize("matchRegistry", registry);
        contractsJson.serialize("fantasyTeamNft", teamNft);
        contractsJson.serialize("scoreManager", scores);
        contractsJson.serialize("legacyPassport", passport);
        string memory finalContractsJson = contractsJson.serialize("contestManager", contests);

        string memory deploymentJson = "deployment";
        deploymentJson.serialize("chainId", block.chainid);
        deploymentJson.serialize("network", _networkName());
        deploymentJson.serialize("deployer", deployer);
        deploymentJson.serialize("generatedAt", block.timestamp);
        string memory finalJson = deploymentJson.serialize("contracts", finalContractsJson);

        string memory path =
            string.concat(vm.projectRoot(), "/../packages/contracts/deployments/", vm.toString(block.chainid), ".json");
        finalJson.write(path);
        console2.log("Deployment JSON:", path);
    }

    function _networkName() private view returns (string memory) {
        if (block.chainid == 31_337) {
            return "anvil";
        }
        if (block.chainid == 92_533) {
            return "wirefluid-testnet";
        }
        return "custom";
    }
}
