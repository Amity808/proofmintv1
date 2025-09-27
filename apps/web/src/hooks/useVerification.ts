import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import {
    createSelfApp,
    CONTRACT_CONFIG
} from '@/utils/selfProtocol';
import proofmintAbi from '@/contract/abi.json';

export const useVerification = () => {
    const { address } = useAccount();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const [selfApp, setSelfApp] = useState<any>(null);
    const [bypassMode, setBypassMode] = useState(false);

    // Use wagmi to read contract state
    const { data: isVerified, refetch: refetchVerification } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'isVerifiedHuman',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 5000, // Refetch every 5 seconds to check for updates
        },
    });

    // Create SelfApp instance when address changes
    useEffect(() => {
        if (address) {
            const app = createSelfApp(address);
            setSelfApp(app);
        } else {
            setSelfApp(null);
        }
    }, [address]);

    // Handle successful verification
    const handleVerificationSuccess = () => {
        setIsVerifying(false);
        setVerificationError(null);
        // Refetch contract state to get updated verification status
        refetchVerification();
        console.log('✅ Human verification completed successfully!');
    };

    // Handle verification error
    const handleVerificationError = (error: any) => {
        setIsVerifying(false);
        setVerificationError('Verification failed. Please try again.');
        console.error('❌ Verification error:', error);
    };

    // Start verification process
    const startVerification = () => {
        if (!address) {
            setVerificationError('Please connect your wallet first.');
            return;
        }

        setIsVerifying(true);
        setVerificationError(null);
    };

    // Reset verification state
    const resetVerification = () => {
        setIsVerifying(false);
        setVerificationError(null);
        refetchVerification();
    };

    // Bypass verification for development/testing (Nigeria users)
    const enableBypassMode = () => {
        setBypassMode(true);
        setVerificationError(null);
        console.log('🔓 Bypass mode enabled - verification skipped');
    };

    const disableBypassMode = () => {
        setBypassMode(false);
        refetchVerification();
        console.log('🔒 Bypass mode disabled - normal verification required');
    };

    return {
        // State
        isVerified: bypassMode || (isVerified || false),
        isVerifying,
        verificationError,
        selfApp,
        bypassMode,

        // Actions
        startVerification,
        handleVerificationSuccess,
        handleVerificationError,
        resetVerification,
        refetchVerification,
        enableBypassMode,
        disableBypassMode,

        // Computed
        canVerify: !!address && !isVerified && !isVerifying && !bypassMode,
        needsWallet: !address,
    };
};
