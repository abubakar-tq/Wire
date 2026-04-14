// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {stdJson} from "forge-std/StdJson.sol";

abstract contract DeploymentReader is Script {
    using stdJson for string;

    function _envOrDeploymentAddress(string memory envKey, string memory jsonKey) internal view returns (address) {
        string memory raw = vm.envOr(envKey, string(""));
        if (bytes(raw).length != 0) {
            return vm.parseAddress(raw);
        }
        return _deploymentAddress(jsonKey);
    }

    function _deploymentAddress(string memory jsonKey) internal view returns (address) {
        string memory path =
            string.concat(vm.projectRoot(), "/../packages/contracts/deployments/", vm.toString(block.chainid), ".json");
        string memory json = vm.readFile(path);
        return json.readAddress(string.concat(".contracts.", jsonKey));
    }
}
