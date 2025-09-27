'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/utils/selfProtocol';
import proofmintAbi from '@/contract/abi.json';

export const MerchantAdmin: React.FC = () => {
    const { address } = useAccount();
    const [targetAddress, setTargetAddress] = useState('');
    const [merchantName, setMerchantName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const { writeContract, data: hash, error, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    // Check if current user is contract owner
    const { data: contractOwner } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'owner',
        query: {
            enabled: !!address,
        },
    });

    const ownerAddress = contractOwner as string | undefined;
    const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase();

    // Check if target address is already a merchant
    const { data: isMerchant } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'isVerifiedMerchant',
        args: targetAddress ? [targetAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!targetAddress,
        },
    });

    const merchantStatus = isMerchant as boolean | undefined;

    const handleAddMerchant = async () => {
        if (!targetAddress || !address) {
            setMessage('Please enter a valid address and ensure you are connected');
            return;
        }

        if (!isOwner) {
            setMessage('❌ Error: Only the contract owner can add merchants');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            console.log('Attempting to add merchant:', targetAddress);
            console.log('Contract address:', CONTRACT_CONFIG.address);
            console.log('Caller address:', address);
            console.log('Is owner:', isOwner);

            await writeContract({
                address: CONTRACT_CONFIG.address as `0x${string}`,
                abi: proofmintAbi,
                functionName: 'addMerchant',
                args: [targetAddress as `0x${string}`],
            });

            console.log('Add merchant transaction submitted successfully');
        } catch (err) {
            console.error('Add merchant error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setMessage(`❌ Error: ${errorMessage}`);
            setIsLoading(false);
        }
    };

    const handleRemoveMerchant = async () => {
        if (!targetAddress || !address) {
            setMessage('Please enter a valid address and ensure you are connected');
            return;
        }

        if (!isOwner) {
            setMessage('❌ Error: Only the contract owner can remove merchants');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            console.log('Attempting to remove merchant:', targetAddress);
            console.log('Contract address:', CONTRACT_CONFIG.address);
            console.log('Caller address:', address);
            console.log('Is owner:', isOwner);

            await writeContract({
                address: CONTRACT_CONFIG.address as `0x${string}`,
                abi: proofmintAbi,
                functionName: 'removeMerchant',
                args: [targetAddress as `0x${string}`],
            });

            console.log('Remove merchant transaction submitted successfully');
        } catch (err) {
            console.error('Remove merchant error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setMessage(`❌ Error: ${errorMessage}`);
            setIsLoading(false);
        }
    };

    // Reset loading state when transaction completes
    React.useEffect(() => {
        if (isSuccess || error) {
            setIsLoading(false);
            if (isSuccess) {
                setMessage('✅ Transaction successful! Merchant status updated.');
                setTargetAddress('');
                setMerchantName('');
            } else if (error) {
                console.error('Transaction error:', error);
                setMessage(`❌ Transaction failed: ${error.message}`);
            }
        }
    }, [isSuccess, error]);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                🏪 Admin: Merchant Management
            </h2>

            {/* Owner Status */}
            <div className={`mb-6 p-4 rounded-md ${isOwner ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {isOwner ? (
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div className="ml-3">
                        <h3 className={`text-sm font-medium ${isOwner ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {isOwner ? '✅ Contract Owner' : '❌ Not Contract Owner'}
                        </h3>
                        <p className={`text-sm mt-1 ${isOwner ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {isOwner
                                ? 'You have permission to manage merchants'
                                : 'Only the contract owner can manage merchants'
                            }
                        </p>
                        {ownerAddress ? (
                            <p className="text-xs mt-1 text-gray-600">
                                Contract Owner: {ownerAddress}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Merchant Address
                    </label>
                    <input
                        id="targetAddress"
                        type="text"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-2">
                        Merchant Name (Optional)
                    </label>
                    <input
                        id="merchantName"
                        type="text"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        placeholder="e.g., Apple Store, Best Buy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Merchant Status */}
                {targetAddress && (
                    <div className={`p-3 rounded-md ${merchantStatus ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                        <p className={`text-sm font-medium ${merchantStatus ? 'text-green-800' : 'text-gray-800'
                            }`}>
                            {merchantStatus ? '✅ Verified Merchant' : '❌ Not a Merchant'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Address: {targetAddress}
                        </p>
                    </div>
                )}

                <div className="flex space-x-4">
                    <button
                        onClick={handleAddMerchant}
                        disabled={isLoading || isPending || isConfirming || !targetAddress || !isOwner || merchantStatus}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                        {isLoading || isPending || isConfirming ? 'Processing...' : '✅ Add Merchant'}
                    </button>

                    <button
                        onClick={handleRemoveMerchant}
                        disabled={isLoading || isPending || isConfirming || !targetAddress || !isOwner || !merchantStatus}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                    >
                        {isLoading || isPending || isConfirming ? 'Processing...' : '❌ Remove Merchant'}
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="font-semibold text-gray-800 mb-2">Quick Actions:</h4>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setTargetAddress(address || '')}
                            disabled={!address}
                            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                        >
                            Use My Address
                        </button>
                        <button
                            onClick={() => {
                                setTargetAddress('');
                                setMerchantName('');
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-md ${message.includes('Error') || message.includes('failed')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="font-semibold text-blue-800 mb-2">📋 Merchant Requirements:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Must be human verified (use Human Verification first)</li>
                        <li>• Must have active subscription to issue receipts</li>
                        <li>• Can set custom merchant name</li>
                        <li>• Can issue NFT receipts to buyers</li>
                    </ul>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Only contract owner can add/remove merchants</li>
                        <li>• Removing a merchant deactivates their subscription</li>
                        <li>• Merchants must be human verified before adding</li>
                        <li>• Use this after verifying humans with the Human Verification tool</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
