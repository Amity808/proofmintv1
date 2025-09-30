import React, { useState } from "react";
import { BuyWidget } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";
import { useAccount } from "wagmi";
import { Wallet, CreditCard, DollarSign } from "lucide-react";

// Thirdweb client configuration
const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id-here",
});

// USDC token address on Celo Sepolia testnet
const USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

interface FundWalletProps {
    onSuccess?: () => void;
    onClose?: () => void;
    defaultAmount?: string;
}

const FundWallet: React.FC<FundWalletProps> = ({
    onSuccess,
    onClose,
    defaultAmount = "10"
}) => {
    const { address } = useAccount();
    const [isVisible, setIsVisible] = useState(true);

    const handleSuccess = () => {
        alert("Wallet funded successfully! You can now purchase subscriptions.");
        setIsVisible(false);
        onSuccess?.();
    };

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Fund Your Wallet</h2>
                            <p className="text-sm text-gray-600">Add USDC to purchase subscriptions</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Wallet Address Display */}
                {address && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Your Wallet</span>
                        </div>
                        <p className="text-sm text-gray-600 font-mono break-all">
                            {address}
                        </p>
                    </div>
                )}

                {/* Funding Instructions */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900 mb-1">
                                Subscription Pricing
                            </h3>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Basic: $10 USDC/month</li>
                                <li>• Premium: $50 USDC/month</li>
                                <li>• Enterprise: $100 USDC/month</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BuyWidget */}
                <div className="space-y-4">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Purchase USDC
                        </h3>
                        <p className="text-sm text-gray-600">
                            Fund your wallet with USDC to purchase subscriptions
                        </p>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <BuyWidget
                            client={client}
                            chain={celo}
                            tokenAddress={USDC_TOKEN_ADDRESS}
                            amount={defaultAmount}
                            onSuccess={handleSuccess}
                            theme="light"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Powered by Thirdweb • Secure payment processing
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FundWallet;
