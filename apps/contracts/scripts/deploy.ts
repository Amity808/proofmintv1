import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Deploying ProofMint to Celo Alfajores...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "CELO");

  // Deploy the upgradeable contract
  const ProofMint = await ethers.getContractFactory("ProofMint");
  
  console.log("Deploying ProofMint implementation and proxy...");
  const proofMint = await upgrades.deployProxy(ProofMint, [], {
    initializer: "initialize",
    kind: "uups"
  });

  await proofMint.waitForDeployment();
  const proofMintAddress = await proofMint.getAddress();

  console.log("ProofMint deployed to:", proofMintAddress);
  
  // Get implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proofMintAddress);
  console.log("Implementation address:", implementationAddress);

  // Verify deployment
  console.log("Verifying deployment...");
  const name = await proofMint.name();
  const symbol = await proofMint.symbol();
  const owner = await proofMint.owner();
  const version = await proofMint.getVersion();
  const nextReceiptId = await proofMint.getnextReceiptId();

  console.log("Contract Details:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Owner:", owner);
  console.log("- Version:", version);
  console.log("- Next Receipt ID:", nextReceiptId.toString());

  console.log("\nDeployment completed successfully!");
  console.log("\nSave these addresses for future upgrades:");
  console.log("Proxy Address:", proofMintAddress);
  console.log("Implementation Address:", implementationAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });