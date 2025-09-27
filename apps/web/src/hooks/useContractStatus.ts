import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/utils/selfProtocol';
import proofmintAbi from "@/contract/abi.json"

// Hook to check if user is a verified merchant
export const useIsMerchant = () => {
  const { address } = useAccount();

  const { data: isMerchant, refetch: refetchMerchant } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: proofmintAbi,
    functionName: 'isVerifiedMerchant',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isMerchant: isMerchant || false,
    refetchMerchant,
  };
};

// Hook to check if user is a verified recycler
export const useIsRecycler = () => {
  const { address } = useAccount();

  const { data: isRecycler, refetch: refetchRecycler } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: proofmintAbi,
    functionName: 'isRecycler',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isRecycler: isRecycler || false,
    refetchRecycler,
  };
};

// Hook to check if merchant can issue receipts
export const useCanIssueReceipts = () => {
  const { address } = useAccount();

  const { data: canIssue, refetch: refetchCanIssue } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: proofmintAbi,
    functionName: 'canIssueReceipts',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    canIssueReceipts: canIssue || false,
    refetchCanIssue,
  };
};

// Hook to get total contract stats
export const useContractStats = () => {
  const { data: totalReceipts, refetch: refetchStats } = useReadContract({
    address: CONTRACT_CONFIG.address as `0x${string}`,
    abi: proofmintAbi,
    functionName: 'getTotalStats',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return {
    totalReceipts: totalReceipts ? Number(totalReceipts) : 0,
    refetchStats,
  };
};
