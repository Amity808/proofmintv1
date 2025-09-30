import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import proofmintAbi from "@/contract/abi.json";

// USDC token address on Celo Sepolia testnet
const USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// USDC ABI for balance checking
const USDC_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const useUSDCBalance = () => {
    const { address } = useAccount();

    const { data: balance, isLoading, error } = useReadContract({
        address: USDC_TOKEN_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const { data: decimals } = useReadContract({
        address: USDC_TOKEN_ADDRESS as `0x${string}`,
        abi: USDC_ABI,
        functionName: "decimals",
    });

    // Convert balance to readable format (USDC has 6 decimals)
    const formattedBalance = balance && decimals
        ? Number(balance) / Math.pow(10, Number(decimals))
        : 0;

    return {
        balance: formattedBalance,
        rawBalance: balance,
        isLoading,
        error,
        hasBalance: formattedBalance > 0,
    };
};

// Hook to check if user has enough USDC for a specific subscription tier
export const useHasEnoughUSDC = (requiredAmount: number) => {
    const { balance, isLoading } = useUSDCBalance();

    return {
        hasEnough: balance >= requiredAmount,
        balance,
        isLoading,
        shortfall: Math.max(0, requiredAmount - balance),
    };
};
