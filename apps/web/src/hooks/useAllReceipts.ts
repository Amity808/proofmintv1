import { useReadContract } from "wagmi";
import { useMemo } from "react";
import proofmintAbi from "@/contract/abi.json";

// Receipt type definition matching the contract struct
export interface Receipt {
    id: number;
    merchant: string;
    buyer: string;
    ipfsHash: string;
    timestamp: number;
    gadgetStatus: number; // 0: Active, 1: Stolen, 2: Misplaced, 3: Recycled
    lastStatusUpdate: number;
}

// Contract address - you may need to update this
const CONTRACT_ADDRESS = "0xd18793cA49171cD6eD7E03fC4C73dC6354D09ebf";

export const useAllReceipts = () => {
    // Get total number of receipts
    const { data: totalReceipts, isLoading: isLoadingTotal } = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: proofmintAbi,
        functionName: "getTotalStats",
    });

    // Create individual hooks for receipts 1-20 (reasonable limit)
    const receipt1 = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: proofmintAbi,
        functionName: "receipts",
        args: [BigInt(1)],
    });
    const receipt2 = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: proofmintAbi,
        functionName: "receipts",
        args: [BigInt(2)],
    });
    const receipt3 = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: proofmintAbi,
        functionName: "receipts",
        args: [BigInt(3)],
    });
    const receipt4 = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: proofmintAbi,
        functionName: "receipts",
        args: [BigInt(4)],
    });
    const receipt5 = useReadContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: proofmintAbi,
        functionName: "receipts",
        args: [BigInt(5)],
    });

    // Process the results
    const receipts = useMemo(() => {
        if (!totalReceipts) return [];

        const total = Math.min(Number(totalReceipts), 5); // Limit to 5 receipts for now
        const receiptQueries = [receipt1, receipt2, receipt3, receipt4, receipt5];
        const validReceipts: Receipt[] = [];

        for (let i = 0; i < total; i++) {
            const query = receiptQueries[i];
            if (query.data && query.data.length >= 7) {
                const receiptData = query.data as any[];
                // Check if receipt exists (merchant is not zero address)
                if (receiptData[1] !== "0x0000000000000000000000000000000000000000") {
                    validReceipts.push({
                        id: i + 1,
                        merchant: receiptData[1],
                        buyer: receiptData[2],
                        ipfsHash: receiptData[3],
                        timestamp: Number(receiptData[4]),
                        gadgetStatus: Number(receiptData[5]),
                        lastStatusUpdate: Number(receiptData[6]),
                    });
                }
            }
        }

        return validReceipts;
    }, [receipt1.data, receipt2.data, receipt3.data, receipt4.data, receipt5.data, totalReceipts]);

    const isLoading = isLoadingTotal || receipt1.isLoading || receipt2.isLoading || receipt3.isLoading || receipt4.isLoading || receipt5.isLoading;
    const error = receipt1.error || receipt2.error || receipt3.error || receipt4.error || receipt5.error;

    return {
        receipts,
        totalReceipts: totalReceipts ? Number(totalReceipts) : 0,
        isLoading,
        error,
    };
};

// Hook to get receipts for a specific merchant
export const useMerchantReceipts = (merchantAddress?: string) => {
    const { receipts, isLoading, error } = useAllReceipts();

    const merchantReceipts = useMemo(() => {
        if (!merchantAddress) return [];
        return receipts.filter(receipt =>
            receipt.merchant.toLowerCase() === merchantAddress.toLowerCase()
        );
    }, [receipts, merchantAddress]);

    return {
        receipts: merchantReceipts,
        isLoading,
        error,
    };
};

// Hook to get receipts for a specific buyer
export const useBuyerReceipts = (buyerAddress?: string) => {
    const { receipts, isLoading, error } = useAllReceipts();

    const buyerReceipts = useMemo(() => {
        if (!buyerAddress) return [];
        return receipts.filter(receipt =>
            receipt.buyer.toLowerCase() === buyerAddress.toLowerCase()
        );
    }, [receipts, buyerAddress]);

    return {
        receipts: buyerReceipts,
        isLoading,
        error,
    };
};
