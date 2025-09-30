"use client";

import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import ReceiptCard from "@/components/common/ReceiptCard";
import StatsCard from "@/components/common/StatsCard";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { useBuyerReceipts } from "@/hooks/useAllReceipts";
import { GadgetStatus } from "@/types";
import { CONTRACT_CONFIG } from "@/utils/selfProtocol";
import proofmintAbi from "@/contract/abi.json";

const Dashboard: React.FC = () => {
    const { isConnected, address } = useAccount();
    const [selectedStatus, setSelectedStatus] = useState<GadgetStatus | "all">("all");
    const [message, setMessage] = useState('');

    // Contract interaction hooks
    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Get real buyer receipts from contract
    const { receipts: buyerReceipts, isLoading: isLoadingReceipts } = useBuyerReceipts(address);

    // Calculate real stats from contract data
    const dashboardStats = {
        totalReceipts: buyerReceipts.length,
        totalSpent: 0, // This would need to be calculated from actual transaction data
        verifiedCount: buyerReceipts.filter(r => r.gadgetStatus === 0).length,
        activeCount: buyerReceipts.filter(r => r.gadgetStatus === 0).length,
        stolenCount: buyerReceipts.filter(r => r.gadgetStatus === 1).length,
        misplacedCount: buyerReceipts.filter(r => r.gadgetStatus === 2).length,
        recycledCount: buyerReceipts.filter(r => r.gadgetStatus === 3).length,
    };

    const filteredReceipts =
        selectedStatus === "all" ? buyerReceipts : buyerReceipts.filter(receipt => receipt.gadgetStatus === selectedStatus);

    const handleViewDetails = (id: string) => {
        console.log("View details for receipt:", id);
        // TODO: Implement receipt details modal
    };

    const handleGenerateQR = (id: string) => {
        console.log("Generate QR for receipt:", id);
        // TODO: Implement QR code generation
    };

    const handleUpdateStatus = async (id: string, status: GadgetStatus) => {
        if (!address) {
            setMessage('❌ Please connect your wallet');
            return;
        }

        setMessage('');

        try {
            // Convert string id to number
            const receiptId = parseInt(id);

            // Update receipt status on contract
            await writeContract({
                address: CONTRACT_CONFIG.address as `0x${string}`,
                abi: proofmintAbi,
                functionName: 'flagGadget',
                args: [BigInt(receiptId), status],
            });

            setMessage('🔄 Status update submitted! Waiting for confirmation...');
        } catch (error) {
            console.error('❌ Status update error:', error);
            setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Handle transaction success
    React.useEffect(() => {
        if (isSuccess) {
            setMessage('✅ Receipt status updated successfully!');
            // Optionally refresh the receipts data
            setTimeout(() => setMessage(''), 3000);
        } else if (error) {
            setMessage(`❌ Transaction failed: ${error.message}`);
        }
    }, [isSuccess, error]);

    if (!isConnected) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Your Dashboard</h1>
                        <p className="text-gray-600 mb-6">Connect your wallet to view your NFT receipts</p>
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
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="relative">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                My Receipts
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600">View and manage your NFT purchase receipts</p>
                        <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Receipts"
                        value={dashboardStats.totalReceipts}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                        color="green"
                    />
                    <StatsCard
                        title="Total Spent"
                        value={`$${dashboardStats.totalSpent.toLocaleString()}`}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                />
                            </svg>
                        }
                        color="blue"
                    />
                    <StatsCard
                        title="Active Receipts"
                        value={dashboardStats.activeCount}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        color="purple"
                    />
                </div>

                {/* Message Display */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') || message.includes('failed')
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                        <div className="flex items-center space-x-2">
                            {message.includes('Error') || message.includes('failed') ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            <span className="font-medium">{message}</span>
                        </div>
                    </div>
                )}

                {/* Status Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedStatus("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === "all"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            All ({buyerReceipts.length})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Active)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Active
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Active ({dashboardStats.activeCount})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Stolen)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Stolen
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Stolen ({dashboardStats.stolenCount})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Misplaced)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Misplaced
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Misplaced ({dashboardStats.misplacedCount})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Recycled)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Recycled
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Recycled ({dashboardStats.recycledCount})
                        </button>
                    </div>
                </div>

                {/* Receipts Grid */}
                {filteredReceipts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredReceipts.map(receipt => (
                            <ReceiptCard
                                key={receipt.id}
                                id={receipt.id.toString()}
                                receipt={receipt}
                                onViewDetails={handleViewDetails}
                                onGenerateQR={handleGenerateQR}
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {selectedStatus === "all"
                                ? "No receipts yet"
                                : `No ${GadgetStatus[selectedStatus].toLowerCase()} receipts`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {selectedStatus === "all"
                                ? "Start shopping to get your first NFT receipt!"
                                : `No receipts with ${GadgetStatus[selectedStatus].toLowerCase()} status found.`}
                        </p>
                        {selectedStatus === "all" && (
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                Browse Marketplace
                            </button>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
