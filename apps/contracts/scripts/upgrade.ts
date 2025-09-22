import { ethers, upgrades } from "hardhat";

async function main() {
  // You need to provide the proxy address from the initial deployment
  const PROXY_ADDRESS = process.env.PROXY_ADDRESS;
  
  if (!PROXY_ADDRESS) {
    console.error("Please set PROXY_ADDRESS environment variable");
    console.error("Example: PROXY_ADDRESS=0x... npm run upgrade");
    process.exit(1);
  }

  console.log("Upgrading ProofMint contract...");
  console.log("Proxy Address:", PROXY_ADDRESS);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Upgrading with account:", deployer.address);

  // Get the new implementation contract factory
  const ProofMintV2 = await ethers.getContractFactory("ProofMint");
  
  console.log("Deploying new implementation...");
  
  // Upgrade the contract
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, ProofMintV2);
  await upgraded.waitForDeployment();

  const newImplementationAddress = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("New implementation deployed to:", newImplementationAddress);

  // Verify the upgrade
  console.log("Verifying upgrade...");
  const version = await upgraded.getVersion();
  const owner = await upgraded.owner();
  
  console.log("Contract Details After Upgrade:");
  console.log("- Version:", version);
  console.log("- Owner:", owner);
  console.log("- Proxy Address (unchanged):", PROXY_ADDRESS);
  console.log("- New Implementation Address:", newImplementationAddress);

  console.log("\nUpgrade completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });