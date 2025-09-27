'use client';

import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';

export const RainbowKitTest: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                🔗 Rainbow Kit Connect Button Test
            </h2>

            <div className="space-y-4">
                {/* Rainbow Kit Connect Button */}
                <div className="text-center">
                    <ConnectButton />
                </div>

                {/* Connection Status */}
                <div className="p-4 bg-gray-50 rounded-md">
                    <h3 className="font-semibold text-gray-800 mb-2">Connection Status:</h3>
                    <p className="text-sm text-gray-600">
                        <strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}
                    </p>
                    {address && (
                        <p className="text-sm text-gray-600 mt-1">
                            <strong>Address:</strong> {address}
                        </p>
                    )}
                </div>

                {/* Disconnect Button */}
                {isConnected && (
                    <button
                        onClick={() => disconnect()}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Disconnect Wallet
                    </button>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h3>
                    <ol className="text-sm text-blue-700 space-y-1">
                        <li>1. Create a <code>.env.local</code> file in the web directory</li>
                        <li>2. Add: <code>NEXT_PUBLIC_WC_PROJECT_ID=your_project_id</code></li>
                        <li>3. Get your project ID from <a href="https://cloud.walletconnect.com/" target="_blank" className="underline">WalletConnect Cloud</a></li>
                        <li>4. Restart the development server</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};
