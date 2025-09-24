// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../contracts/ProofMintWithSelfVerification.sol";

contract DeployProofMintWithSelfVerification is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Self Protocol configuration
        address identityVerificationHubV2 = vm.envAddress(
            "SELF_IDENTITY_VERIFICATION_HUB_V2"
        );
        uint256 scope = vm.envUint("SELF_SCOPE");
        bytes32 verificationConfigId = vm.envBytes32(
            "SELF_VERIFICATION_CONFIG_ID"
        );

        vm.startBroadcast(deployer);

        ProofMintWithSelfVerification proofMint = new ProofMintWithSelfVerification(
                0x68c931C9a534D37aa78094877F46fE46a49F1A51,
                scope,
                verificationConfigId
            );

        vm.stopBroadcast();

        console.log(
            "ProofMintWithSelfVerification deployed at:",
            address(proofMint)
        );
        console.log("Deployer:", deployer);
        console.log("Identity Verification Hub V2:", identityVerificationHubV2);
        console.log("Scope:", scope);
        console.log(
            "Verification Config ID:",
            vm.toString(verificationConfigId)
        );
    }
}
