import hre from "hardhat";

async function main() {
    console.log("Deploying ProofMintWithSelfVerification to Celo Alfajores...");

    // Get the deployer account
    const signers = await hre.ethers.getSigners();
    if (signers.length === 0) {
        throw new Error("No signers found. Please set PRIVATE_KEY environment variable.");
    }
    const deployer = signers[0];
    console.log("Deploying with account:", await deployer.getAddress());
    console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(await deployer.getAddress())), "CELO");

    // Self Protocol configuration - using hardcoded values for now
    const identityVerificationHubV2 = "0x68c931C9a534D37aa78094877F46fE46a49F1A51";
    const scope = "9398241477204171864069474337943544794043419568465634980149683672897061745343";
    const verificationConfigId = "0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61";

    console.log("Self Protocol Configuration:");
    console.log("- Identity Verification Hub V2:", identityVerificationHubV2);
    console.log("- Scope:", scope);
    console.log("- Verification Config ID:", verificationConfigId);

    // Deploy the contract
    const ProofMintWithSelfVerification = await hre.ethers.getContractFactory("ProofMintWithSelfVerification");

    console.log("Deploying ProofMintWithSelfVerification...");
    const proofMint = await ProofMintWithSelfVerification.deploy(
        identityVerificationHubV2,
        scope,
        verificationConfigId
    );

    await proofMint.waitForDeployment();
    const proofMintAddress = await proofMint.getAddress();

    console.log("ProofMintWithSelfVerification deployed to:", proofMintAddress);

    // Verify deployment
    console.log("Verifying deployment...");
    const name = await proofMint.name();
    const symbol = await proofMint.symbol();
    const owner = await proofMint.owner();
    const version = await proofMint.getVersion();
    const nextReceiptId = await proofMint.getnextReceiptId();
    const configId = await proofMint.verificationConfigId();

    console.log("Contract Details:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Owner:", owner);
    console.log("- Version:", version);
    console.log("- Next Receipt ID:", nextReceiptId.toString());
    console.log("- Verification Config ID:", configId);

    console.log("\nDeployment completed successfully!");
    console.log("\nContract Address:", proofMintAddress);
    console.log("\nNext steps:");
    console.log("1. Add merchants using addMerchant() function");
    console.log("2. Add recyclers using addRecycler() function");
    console.log("3. Users need to complete human verification before using the contract");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
