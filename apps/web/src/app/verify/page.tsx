'use client';

import React from 'react';
import { HumanVerification } from '@/components/Verification/HumanVerification';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

const VerifyPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            ProofMint Verification
                        </h1>
                        <p className="text-lg text-gray-600">
                            Complete human verification to access all ProofMint features
                        </p>
                    </div>

                    {/* Verification Component */}
                    <HumanVerification />

                    {/* Additional Info */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Why Human Verification?
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                <p>Prevents bot abuse and ensures only real humans can interact with the platform</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                <p>Required for merchants to issue receipts and manage subscriptions</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                <p>Enables secure gadget ownership tracking and lifecycle management</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                <p>Protects the integrity of the decentralized supply chain system</p>
                            </div>
                        </div>
                    </div>

                    {/* Contract Info */}
                    <div className="mt-6 bg-gray-100 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Contract Information</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                            <p><strong>Contract Address:</strong> 0x2438d45101c8062d5B0007B631C04fB42647705D</p>
                            <p><strong>Network:</strong> Celo Alfajores Testnet</p>
                            <p><strong>Version:</strong> 2.0.0-with-self-verification</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default VerifyPage;
