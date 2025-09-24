# my-celo-app - Smart Contracts

This directory contains the smart contracts for my-celo-app, built with Hardhat and optimized for the Celo blockchain.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to Alfajores testnet
pnpm deploy:alfajores

# Deploy to Celo mainnet
pnpm deploy:celo
```

## 📜 Available Scripts

- `pnpm compile` - Compile smart contracts
- `pnpm test` - Run contract tests
- `pnpm deploy` - Deploy to local network
- `pnpm deploy:alfajores` - Deploy to Celo Alfajores testnet
- `pnpm deploy:celo` - Deploy to Celo mainnet
- `pnpm verify` - Verify contracts on Celoscan
- `pnpm clean` - Clean artifacts and cache

## 🌐 Networks

### Celo Mainnet
- **Chain ID**: 42220
- **RPC URL**: https://forno.celo.org
- **Explorer**: https://celoscan.io

### Alfajores Testnet
- **Chain ID**: 44787
- **RPC URL**: https://alfajores-forno.celo-testnet.org
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org

## 🔧 Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your private key and API keys:
   ```env
   PRIVATE_KEY=your_private_key_without_0x_prefix
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```

## 📁 Project Structure

```
contracts/          # Smart contract source files
├── Lock.sol        # Sample timelock contract

test/              # Contract tests
├── Lock.ts        # Tests for Lock contract

ignition/          # Deployment scripts
└── modules/
    └── Lock.ts    # Lock contract deployment

hardhat.config.ts  # Hardhat configuration
tsconfig.json      # TypeScript configuration
```

## 🔐 Security Notes

- Never commit your `.env` file with real private keys
- Use a dedicated wallet for development/testing
- Test thoroughly on Alfajores before mainnet deployment
- Consider using a hardware wallet for mainnet deployments

## 📚 Learn More

- [Hardhat Documentation](https://hardhat.org/docs)
- [Celo Developer Documentation](https://docs.celo.org)
- [Celo Smart Contract Best Practices](https://docs.celo.org/developer/contractkit)
- [Viem Documentation](https://viem.sh) (Ethereum library used by Hardhat)



Deploying ProofMintWithSelfVerification to Celo Alfajores...
Deploying with account: 0x9dBa18e9b96b905919cC828C399d313EfD55D800
Account balance: 1.0 CELO
Self Protocol Configuration:
- Identity Verification Hub V2: 0x68c931C9a534D37aa78094877F46fE46a49F1A51
- Scope: 9398241477204171864069474337943544794043419568465634980149683672897061745343
- Verification Config ID: 0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61
Deploying ProofMintWithSelfVerification...
ProofMintWithSelfVerification deployed to: 0x8dcc416736ad938bd0768f44857C51a8f5E9a4c9
Verifying deployment...
Contract Details:
- Name: Proofmint
- Symbol: PFMT
- Owner: 0x9dBa18e9b96b905919cC828C399d313EfD55D800
- Version: 2.0.0-with-self-verification
- Next Receipt ID: 1
- Verification Config ID: 0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61

Deployment completed successfully!

Contract Address: 0x8dcc416736ad938bd0768f44857C51a8f5E9a4c9

Next steps:
1. Add merchants using addMerchant() function
2. Add recyclers using addRecycler() function
3. Users need to complete human verification before using the contract
amityclev@Mac contracts % 