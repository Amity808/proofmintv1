'use client';

import React from 'react';
import { SelfQRcodeWrapper } from '@selfxyz/qrcode';
import { getUniversalLink } from '@selfxyz/core';
import { useVerification } from '@/hooks/useVerification';
import { useIsMerchant, useIsRecycler, useCanIssueReceipts } from '@/hooks/useContractStatus';

export const HumanVerification: React.FC = () => {
    const {
        isVerified,
        isVerifying,
        verificationError,
        selfApp,
        startVerification,
        handleVerificationSuccess,
        handleVerificationError,
        canVerify,
        needsWallet,
        bypassMode,
        enableBypassMode,
        disableBypassMode,
    } = useVerification();

    // Get additional contract status
    const { isMerchant } = useIsMerchant();
    const { isRecycler } = useIsRecycler();
    const { canIssueReceipts } = useCanIssueReceipts();

    // Generate universal link for mobile
    const universalLink = selfApp ? getUniversalLink(selfApp) : '';

    // Handle opening Self app directly
    const openSelfApp = () => {
        if (universalLink) {
            window.open(universalLink, '_blank');
        }
    };

    // Already verified
    if (isVerified) {
        return (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-800">
                            ✅ Human Verification Complete
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                            You are verified and can now use all ProofMint features.
                            {bypassMode && (
                                <span className="block mt-1 text-yellow-600">
                                    🔓 Currently in bypass mode (Self verification not available in Nigeria)
                                </span>
                            )}
                        </p>

                        {/* Show role status */}
                        <div className="mt-3 space-y-1">
                            {isMerchant && (
                                <div className="flex items-center text-xs">
                                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded mr-2">Merchant</span>
                                    {canIssueReceipts ? (
                                        <span className="text-green-600">✓ Can issue receipts</span>
                                    ) : (
                                        <span className="text-yellow-600">⚠ Needs subscription</span>
                                    )}
                                </div>
                            )}
                            {isRecycler && (
                                <div className="flex items-center text-xs">
                                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded mr-2">Recycler</span>
                                    <span className="text-green-600">✓ Can process recycling</span>
                                </div>
                            )}
                            {!isMerchant && !isRecycler && (
                                <div className="text-xs text-green-600">
                                    Contact admin to become a merchant or recycler
                                </div>
                            )}
                        </div>

                        {/* Bypass mode controls */}
                        {bypassMode && (
                            <div className="mt-4 pt-3 border-t border-green-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-yellow-600">
                                        🔓 Bypass mode active
                                    </span>
                                    <button
                                        onClick={disableBypassMode}
                                        className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                                    >
                                        Disable Bypass
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Need wallet connection
    if (needsWallet) {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                            Wallet Required
                        </h3>
                        <p className="text-sm text-yellow-700 mt-1">
                            Please connect your wallet to start human verification.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Verification error
    if (verificationError) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Verification Failed
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                            {verificationError}
                        </p>
                        <button
                            onClick={startVerification}
                            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Ready to verify
    if (canVerify) {
        return (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                        Human Verification Required
                    </h3>
                    <p className="text-sm text-blue-700 mb-4">
                        To use ProofMint, you need to complete human verification to prove you're not a bot.
                        This ensures the security and integrity of our platform.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={startVerification}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                        >
                            Start Verification
                        </button>

                        {/* Nigeria Bypass Option */}
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800 mb-2">
                                🇳🇬 <strong>Nigeria Users:</strong> Self verification is not available in Nigeria
                            </p>
                            <button
                                onClick={enableBypassMode}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                🔓 Enable Bypass Mode (Development)
                            </button>
                            <p className="text-xs text-yellow-700 mt-1">
                                This bypasses verification for testing purposes
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Verification in progress
    if (isVerifying && selfApp) {
        return (
            <div className="bg-blue-50 border border-blue-200 px-6 py-8 rounded-lg">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-blue-800 mb-4">
                        Complete Human Verification
                    </h3>
                    <p className="text-sm text-blue-700 mb-6">
                        Scan the QR code below with the Self app to verify your identity.
                    </p>

                    {/* QR Code Component */}
                    <div className="flex justify-center mb-6">
                        <SelfQRcodeWrapper
                            selfApp={selfApp}
                            onSuccess={handleVerificationSuccess}
                            onError={handleVerificationError}
                        />
                    </div>

                    {/* Universal Link for Mobile */}
                    {universalLink && (
                        <div className="mt-4">
                            <p className="text-sm text-blue-600 mb-2">
                                On mobile? Use the direct link:
                            </p>
                            <button
                                onClick={openSelfApp}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                                Open Self App
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-xs text-blue-600">
                        <p>• Download the Self app from your app store</p>
                        <p>• Scan the QR code or tap the button above</p>
                        <p>• Follow the verification steps in the app</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
