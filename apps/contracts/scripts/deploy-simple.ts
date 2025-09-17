import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying ProofMint to Celo Alfajores...");
  
  // Check if we have any signers
  try {
    const signers = await ethers.getSigners();
    console.log("Available signers:", signers.length);
    
    if (signers.length === 0) {
      console.error("No signers found. Please check your PRIVATE_KEY configuration.");
      return;
    }

    const deployer = signers[0];
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "CELO");
    
    if (balance === 0n) {
      console.error("Account has no CELO. Please fund your account first.");
      return;
    }

    // Deploy the upgradeable contract
    const ProofMint = await ethers.getContractFactory("ProofMint");
    
    console.log("Deploying ProofMint implementation and proxy...");
    const proofMint = await upgrades.deployProxy(ProofMint, [], {
      initializer: "initialize",
      kind: "uups"
    });

    console.log("Waiting for deployment...");
    await proofMint.waitForDeployment();
    const proofMintAddress = await proofMint.getAddress();

    console.log("✅ ProofMint deployed to:", proofMintAddress);
    
    // Get implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proofMintAddress);
    console.log("📄 Implementation address:", implementationAddress);

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const name = await proofMint.name();
    const symbol = await proofMint.symbol();
    const owner = await proofMint.owner();
    const version = await proofMint.getVersion();
    const nextReceiptId = await proofMint.getnextReceiptId();

    console.log("\n📋 Contract Details:");
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Owner:", owner);
    console.log("   Version:", version);
    console.log("   Next Receipt ID:", nextReceiptId.toString());

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n💾 Save these addresses:");
    console.log("   Proxy Address:", proofMintAddress);
    console.log("   Implementation Address:", implementationAddress);
    console.log("\n🔗 View on Celo Explorer:");
    console.log("   https://alfajores.celoscan.io/address/" + proofMintAddress);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });