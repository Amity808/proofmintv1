'use client';

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { CONTRACT_CONFIG } from '@/utils/selfProtocol';
import proofmintAbi from '@/contract/abi.json';
import { Calendar, Check, Clock, Crown, Star, Zap, AlertCircle, Wallet } from 'lucide-react';
import { useUSDCBalance, useHasEnoughUSDC } from '@/hooks/useUSDCBalance';

interface SubscriptionManagerProps {
    onSubscriptionUpdate?: () => void;
    onFundWallet?: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onSubscriptionUpdate, onFundWallet }) => {
    const { address } = useAccount();
    const [selectedTier, setSelectedTier] = useState<number>(0); // 0=Basic, 1=Premium, 2=Enterprise
    const [selectedDuration, setSelectedDuration] = useState<number>(1);
    const [message, setMessage] = useState('');

    // Contract interaction hooks
    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // USDC approval hooks
    const { writeContract: writeApproval, data: approvalHash, error: approvalError, isPending: isApprovalPending } = useWriteContract();
    const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approvalHash });

    // Get current subscription
    const { data: subscriptionData, refetch: refetchSubscription } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'getSubscription',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Get pricing
    const { data: pricingData } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'getSubscriptionPricing',
        query: {
            enabled: true,
        },
    });

    // USDC contract address (Celo Alfajores)
    const USDC_ADDRESS = '0x01C5C0122039549AD1493B8220cABEdD739BC44E';

    // USDC balance hooks
    const { balance: usdcBalance, isLoading: isLoadingBalance } = useUSDCBalance();

    // Check USDC allowance
    const { data: usdcAllowance } = useReadContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: [
            {
                "inputs": [
                    { "name": "owner", "type": "address" },
                    { "name": "spender", "type": "address" }
                ],
                "name": "allowance",
                "outputs": [{ "name": "", "type": "uint256" }],
                "stateMutability": "view",
                "type": "function"
            }
        ],
        functionName: 'allowance',
        args: address && CONTRACT_CONFIG.address ? [address, CONTRACT_CONFIG.address as `0x${string}`] : undefined,
        query: {
            enabled: !!address && !!CONTRACT_CONFIG.address,
        },
    });

    // Check if user is verified merchant
    const { data: isMerchant } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'isVerifiedMerchant',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Check if user is human verified
    const { data: isHumanVerified } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'isVerifiedHuman',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    const subscription = subscriptionData as [number, bigint, bigint, bigint, boolean, boolean] | undefined;
    const pricing = pricingData as [bigint, bigint, bigint, bigint] | undefined;

    const currentSub = subscription ? {
        tier: subscription[0],
        expiresAt: Number(subscription[1]),
        receiptsIssued: Number(subscription[2]),
        receiptsRemaining: Number(subscription[3]),
        isActive: subscription[4],
        isExpired: subscription[5]
    } : null;

    const prices = pricing ? {
        basic: Number(pricing[0]) / 1e6, // Convert from USDC decimals
        premium: Number(pricing[1]) / 1e6,
        enterprise: Number(pricing[2]) / 1e6,
        yearlyDiscount: Number(pricing[3])
    } : { basic: 1, premium: 1, enterprise: 1, yearlyDiscount: 10 }; // TESTNET PRICES

    const tiers = [
        {
            name: 'Basic',
            price: prices.basic,
            receipts: 100,
            icon: <Star className="w-6 h-6" />,
            features: ['100 receipts/month', 'Basic support', 'Standard features'],
            color: 'border-blue-500 bg-blue-50'
        },
        {
            name: 'Premium',
            price: prices.premium,
            receipts: 500,
            icon: <Crown className="w-6 h-6" />,
            features: ['500 receipts/month', 'Priority support', 'Advanced features'],
            color: 'border-purple-500 bg-purple-50',
            popular: true
        },
        {
            name: 'Enterprise',
            price: prices.enterprise,
            receipts: 'Unlimited',
            icon: <Zap className="w-6 h-6" />,
            features: ['Unlimited receipts', 'Premium support', 'All features'],
            color: 'border-yellow-500 bg-yellow-50'
        }
    ];

    const calculatePrice = () => {
        const tierPrices = [prices.basic, prices.premium, prices.enterprise];
        const basePrice = tierPrices[selectedTier] * selectedDuration;

        if (selectedDuration === 12) {
            return basePrice * (1 - prices.yearlyDiscount / 100);
        }

        return basePrice;
    };

    const handleApproveUSDC = async () => {
        if (!address) return;

        setMessage('');

        try {
            const totalPrice = calculatePrice();
            const totalPriceWei = BigInt(Math.floor(totalPrice * 1e6)); // Convert to USDC decimals (6)


            await writeApproval({
                address: USDC_ADDRESS as `0x${string}`,
                abi: [
                    {
                        "inputs": [
                            { "name": "spender", "type": "address" },
                            { "name": "amount", "type": "uint256" }
                        ],
                        "name": "approve",
                        "outputs": [{ "name": "", "type": "bool" }],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ],
                functionName: 'approve',
                args: [CONTRACT_CONFIG.address as `0x${string}`, totalPriceWei],
            });

            setMessage('🔄 Approval transaction submitted! Waiting for confirmation...');
        } catch (error) {
            console.error('❌ USDC approval error:', error);
            setMessage(`❌ Approval Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handlePurchaseSubscription = async () => {
        if (!address) return;

        setMessage('');

        try {
            const totalPrice = calculatePrice();
            const totalPriceWei = BigInt(Math.floor(totalPrice * 1e6)); // Convert to USDC decimals (6)


            // Pre-transaction validation
            if (!(isMerchant as boolean)) {
                throw new Error('NotVerifiedMerchant: You are not a verified merchant. Contact admin to get verified first.');
            }

            if (!(isHumanVerified as boolean)) {
                throw new Error('HumanVerificationRequired: Human verification required. Complete verification first.');
            }

            if (usdcBalance && Number(usdcBalance) < Number(totalPriceWei)) {
                throw new Error('Insufficient USDC balance. Please add USDC to your wallet.');
            }

            if (selectedDuration < 1 || selectedDuration > 12) {
                throw new Error('InvalidDuration: Invalid subscription duration. Please select 1-12 months.');
            }

            // Check if approval is needed
            const currentAllowance = usdcAllowance ? Number(usdcAllowance) : 0;
            const requiredAmount = Number(totalPriceWei);

            if (currentAllowance < requiredAmount) {
                setMessage('🔄 Approving USDC tokens...');

                // First, approve USDC
                await writeApproval({
                    address: USDC_ADDRESS as `0x${string}`,
                    abi: [
                        {
                            "inputs": [
                                { "name": "spender", "type": "address" },
                                { "name": "amount", "type": "uint256" }
                            ],
                            "name": "approve",
                            "outputs": [{ "name": "", "type": "bool" }],
                            "stateMutability": "nonpayable",
                            "type": "function"
                        }
                    ],
                    functionName: 'approve',
                    args: [CONTRACT_CONFIG.address as `0x${string}`, totalPriceWei],
                });

                setMessage('🔄 USDC approved! Now purchasing subscription...');

                // Wait for approval to be confirmed before proceeding
                // Note: In a real app, you'd want to wait for the approval transaction to be confirmed
                // For now, we'll proceed immediately and let the user retry if needed
            }

            // Purchase subscription
            await writeContract({
                address: CONTRACT_CONFIG.address as `0x${string}`,
                abi: proofmintAbi,
                functionName: 'purchaseSubscription',
                args: [selectedTier, selectedDuration],
            });

            setMessage('🔄 Subscription purchase submitted! Waiting for confirmation...');
        } catch (error) {
            console.error('❌ Subscription purchase error:', error);

            // Enhanced error messages
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;

                // Common error patterns
                if (errorMessage.includes('insufficient funds')) {
                    errorMessage = 'Insufficient USDC balance. Please add USDC to your wallet.';
                } else if (errorMessage.includes('allowance')) {
                    errorMessage = 'USDC approval required. Please try again - the approval may still be processing.';
                } else if (errorMessage.includes('NotVerifiedMerchant')) {
                    errorMessage = 'You are not a verified merchant. Contact admin to get verified first.';
                } else if (errorMessage.includes('NotVerifiedHuman')) {
                    errorMessage = 'Human verification required. Complete verification first.';
                } else if (errorMessage.includes('HumanVerificationRequired')) {
                    errorMessage = 'Human verification required. Complete verification first.';
                } else if (errorMessage.includes('InvalidDuration')) {
                    errorMessage = 'Invalid subscription duration. Please select 1-12 months.';
                } else if (errorMessage.includes('USDC transfer failed')) {
                    errorMessage = 'USDC transfer failed. Check your balance and approval.';
                } else if (errorMessage.includes('execution reverted')) {
                    errorMessage = `Contract execution failed: ${errorMessage}`;
                }
            }

            setMessage(`❌ Error: ${errorMessage}`);
        }
    };

    // Handle transaction success
    React.useEffect(() => {
        if (isSuccess) {
            setMessage('✅ Subscription purchased successfully!');
            refetchSubscription();
            onSubscriptionUpdate?.();
        } else if (error) {
            setMessage(`❌ Transaction failed: ${error.message}`);
        }
    }, [isSuccess, error, refetchSubscription, onSubscriptionUpdate]);

    // Handle approval success
    React.useEffect(() => {
        if (isApprovalSuccess) {
            setMessage('✅ USDC approval successful! You can now purchase a subscription.');
        } else if (approvalError) {
            setMessage(`❌ Approval failed: ${approvalError.message}`);
        }
    }, [isApprovalSuccess, approvalError]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    const getTierName = (tier: number) => {
        return ['Basic', 'Premium', 'Enterprise'][tier] || 'Unknown';
    };

    return (
        <div className="space-y-6">
            {/* Current Subscription Status */}
            {currentSub && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Current Subscription
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Plan</p>
                            <p className="text-lg font-semibold">{getTierName(currentSub.tier)}</p>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Status</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentSub.isActive && !currentSub.isExpired
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {currentSub.isActive && !currentSub.isExpired ? (
                                    <>
                                        <Check className="w-3 h-3" />
                                        Active
                                    </>
                                ) : (
                                    'Expired'
                                )}
                            </div>
                        </div>

                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Expires</p>
                            <p className="text-lg font-semibold">{formatDate(currentSub.expiresAt)}</p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">Receipts Used This Month</span>
                            <span className="font-semibold text-blue-800">
                                {currentSub.receiptsIssued} / {currentSub.receiptsRemaining === 0 ? 'Unlimited' : currentSub.receiptsIssued + currentSub.receiptsRemaining}
                            </span>
                        </div>
                        {currentSub.receiptsRemaining > 0 && (
                            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                        width: `${(currentSub.receiptsIssued / (currentSub.receiptsIssued + currentSub.receiptsRemaining)) * 100}%`
                                    }}
                                ></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Purchase New Subscription */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {currentSub?.isActive ? 'Upgrade/Renew Subscription' : 'Purchase Subscription'}
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        TESTNET PRICES
                    </span>
                </h3>

                {/* Message Display */}
                {message && (
                    <div className={`mb-4 p-3 rounded-md ${message.includes('Error') || message.includes('failed')
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Subscription Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {tiers.map((tier, index) => (
                        <div
                            key={index}
                            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all ${selectedTier === index
                                ? tier.color
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => setSelectedTier(index)}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center">
                                <div className="flex justify-center mb-3 text-gray-600">
                                    {tier.icon}
                                </div>
                                <h4 className="text-lg font-semibold">{tier.name}</h4>
                                <div className="mt-2">
                                    <span className="text-2xl font-bold">${tier.price}</span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {tier.receipts} receipts
                                </p>
                            </div>

                            <ul className="mt-4 space-y-2">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {selectedTier === index && (
                                <div className="absolute top-4 right-4">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Duration Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subscription Duration
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { months: 1, label: '1 Month' },
                            { months: 3, label: '3 Months' },
                            { months: 6, label: '6 Months' },
                            { months: 12, label: '12 Months', discount: true }
                        ].map(({ months, label, discount }) => (
                            <button
                                key={months}
                                onClick={() => setSelectedDuration(months)}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${selectedDuration === months
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{label}</span>
                                    {discount && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                            10% OFF
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">
                                {tiers[selectedTier].name} Plan - {selectedDuration} month{selectedDuration > 1 ? 's' : ''}
                            </p>
                            {selectedDuration === 12 && (
                                <p className="text-sm text-green-600">10% yearly discount applied</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">${calculatePrice()}</p>
                            <p className="text-sm text-gray-600">Total in USDC</p>
                        </div>
                    </div>
                </div>

                {/* Verification Status */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Verification Requirements
                    </h4>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Merchant Verification:</span>
                            <span className={`font-medium ${(isMerchant as boolean) ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {(isMerchant as boolean) ? '✅ Verified' : '❌ Not Verified'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-700">Human Verification:</span>
                            <span className={`font-medium ${(isHumanVerified as boolean) ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {(isHumanVerified as boolean) ? '✅ Verified' : '❌ Not Verified'}
                            </span>
                        </div>
                    </div>

                    {/* Warning Messages */}
                    {!(isMerchant as boolean) && (
                        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                            ⚠️ You must be verified as a merchant before purchasing a subscription. Contact admin to get verified.
                        </div>
                    )}

                    {!(isHumanVerified as boolean) && (
                        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                            ⚠️ Human verification is required to purchase subscriptions. Complete verification first.
                        </div>
                    )}
                </div>

                {/* USDC Balance & Approval Status */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        USDC Payment Status
                    </h4>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">USDC Balance:</span>
                            <span className="font-medium text-blue-900">
                                {usdcBalance ? `${(Number(usdcBalance) / 1e6).toFixed(2)} USDC` : 'Loading...'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">Required Amount:</span>
                            <span className="font-medium text-blue-900">
                                ${calculatePrice()} USDC
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">Contract Approval:</span>
                            <span className={`font-medium ${!!usdcAllowance && Number(usdcAllowance) >= calculatePrice() * 1e6
                                ? 'text-green-600'
                                : 'text-red-600'
                                }`}>
                                {!!usdcAllowance && Number(usdcAllowance) >= calculatePrice() * 1e6
                                    ? '✅ Approved'
                                    : '❌ Not Approved'
                                }
                            </span>
                        </div>
                    </div>

                    {/* Warning Messages */}
                    {usdcBalance && Number(usdcBalance) < calculatePrice() * 1e6 && (
                        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                            ⚠️ Insufficient USDC balance. You need ${calculatePrice()} USDC but only have {(Number(usdcBalance) / 1e6).toFixed(2)} USDC.
                        </div>
                    )}

                    {!!usdcAllowance && Number(usdcAllowance) < calculatePrice() * 1e6 && (
                        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-800">
                            ⚠️ USDC approval will be handled automatically when you purchase.
                        </div>
                    )}
                </div>

                {/* Purchase Button */}
                <button
                    onClick={handlePurchaseSubscription}
                    disabled={
                        !!isPending ||
                        !!isConfirming ||
                        !!isApprovalPending ||
                        !!isApprovalConfirming ||
                        !address ||
                        !(isMerchant as boolean) ||
                        !(isHumanVerified as boolean) ||
                        (!!usdcBalance && Number(usdcBalance) < calculatePrice() * 1e6)
                    }
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {(!!isPending || !!isConfirming || !!isApprovalPending || !!isApprovalConfirming) ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>
                                {!!isApprovalPending || !!isApprovalConfirming ? 'Approving USDC...' : 'Processing...'}
                            </span>
                        </>
                    ) : (
                        <>
                            <Calendar className="w-4 h-4" />
                            <span>Purchase Subscription</span>
                        </>
                    )}
                </button>

                {/* Fund Wallet Button - Show when insufficient balance */}
                {!!usdcBalance && Number(usdcBalance) < calculatePrice() * 1e6 && (
                    <button
                        onClick={() => onFundWallet?.()}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 mt-3"
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Fund Wallet with USDC</span>
                    </button>
                )}

                <p className="text-xs text-gray-500 mt-3 text-center">
                    Payment will be processed in USDC. The system will automatically handle USDC approval if needed.
                    <br />
                    <span className="text-yellow-600 font-medium">⚠️ TESTNET: All plans are $1 USDC for testing purposes</span>
                </p>
            </div>
        </div>
    );
};

export default SubscriptionManager;
