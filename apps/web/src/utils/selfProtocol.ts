import { SelfAppBuilder, type SelfApp } from '@selfxyz/qrcode';
import { ethers } from 'ethers';

// Contract configuration from deployment
export const CONTRACT_CONFIG = {
    address: "0xd18793cA49171cD6eD7E03fC4C73dC6354D09ebf",
    hubAddress: "0x68c931C9a534D37aa78094877F46fE46a49F1A51",
    scope: "9398241477204171864069474337943544794043419568465634980149683672897061745343",
    configId: "0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61"
};

// Create SelfApp instance for verification
export const createSelfApp = (userWalletAddress: string): SelfApp => {
    return new SelfAppBuilder({
        // Contract integration settings
        endpoint: CONTRACT_CONFIG.address,           // Deployed contract address
        endpointType: "staging_celo",               // Celo Alfajores testnet
        userIdType: "hex",                          // Wallet addresses
        version: 2,                                 // V2 for contracts

        // App details
        appName: "ProofMint",
        scope: "proofmint-app",                     // App identifier (max 30 chars)
        userId: userWalletAddress,

        // Verification configuration (must match contract)
        disclosures: {
            // Verification requirements
            minimumAge: 18,                           // Minimum age requirement
            excludedCountries: [],                    // No country restrictions
            ofac: false,                             // No OFAC sanctions checking

            // Data disclosures (what users reveal)
            nationality: true,                        // Nationality/citizenship
            gender: true,                            // Gender
            name: false,                             // Don't require full name
            date_of_birth: false,                    // Don't require DOB
            passport_number: false,                  // Don't require passport number
            expiry_date: false,                      // Don't require expiry date
            issuing_state: false,                    // Don't require issuing state
        },

        // Optional: dynamic data for contract
        userDefinedData: "ProofMint Verification",

        // App branding
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png", // Default Self logo
    }).build();
};

// Contract ABI for ProofMint functions
export const PROOFMINT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_user",
                "type": "address"
            }
        ],
        "name": "isVerifiedHuman",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "merchant",
                "type": "address"
            }
        ],
        "name": "isVerifiedMerchant",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recycler",
                "type": "address"
            }
        ],
        "name": "isRecycler",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "merchant",
                "type": "address"
            }
        ],
        "name": "canIssueReceipts",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalReceipts",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
