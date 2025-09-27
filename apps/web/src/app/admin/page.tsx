"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { VerificationAdmin } from "@/components/Admin/VerificationAdmin";
import { MerchantAdmin } from "@/components/Admin/MerchantAdmin";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

const AdminPage: React.FC = () => {
    const { isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState<'verification' | 'merchants'>('verification');

    if (!isConnected) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
                        <p className="text-gray-600 mb-6">Connect your wallet to access admin functions</p>
                        <ConnectButton />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 p-4">
                <div className="container mx-auto">
                    {/* Admin Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('verification')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'verification'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    🔧 Human Verification
                                </button>
                                <button
                                    onClick={() => setActiveTab('merchants')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'merchants'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    🏪 Merchant Management
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'verification' && <VerificationAdmin />}
                    {activeTab === 'merchants' && <MerchantAdmin />}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminPage;
