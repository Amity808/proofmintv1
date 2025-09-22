// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ProofMintModule = buildModule("ProofMintModule", (m) => {
  // Deploy the implementation contract
  const proofMintImpl = m.contract("ProofMint", []);

  // Deploy the proxy with initialization
  const proxy = m.contract("ERC1967Proxy", [
    proofMintImpl,
    m.encodeFunctionCall(proofMintImpl, "initialize", [])
  ]);

  // Get the ProofMint contract interface attached to the proxy address
  const proofMint = m.contractAt("ProofMint", proxy);

  return { 
    implementation: proofMintImpl,
    proxy: proxy,
    proofMint: proofMint
  };
});

export default ProofMintModule;