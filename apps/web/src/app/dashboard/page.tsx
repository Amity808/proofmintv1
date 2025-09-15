"use client";

import React, { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import ReceiptCard from "@/components/common/ReceiptCard";
import StatsCard from "@/components/common/StatsCard";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { dummyDashboardStats, dummyReceipts } from "@/data/dummyData";
import { GadgetStatus } from "@/types";

const Dashboard: React.FC = () => {
    const { isConnected } = useAccount();
    const [selectedStatus, setSelectedStatus] = useState<GadgetStatus | "all">("all");

    const filteredReceipts =
        selectedStatus === "all" ? dummyReceipts : dummyReceipts.filter(receipt => receipt.status === selectedStatus);

    const handleViewDetails = (id: string) => {
        console.log("View details for receipt:", id);
        // TODO: Implement receipt details modal
    };

    const handleGenerateQR = (id: string) => {
        console.log("Generate QR for receipt:", id);
        // TODO: Implement QR code generation
    };

    const handleUpdateStatus = (id: string, status: GadgetStatus) => {
        console.log("Update status for receipt:", id, "to:", status);
        // TODO: Implement status update
    };

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
                        value={dummyDashboardStats.totalReceipts}
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
                        value={`$${dummyDashboardStats.totalSpent.toLocaleString()}`}
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
                        title="Verified"
                        value={dummyDashboardStats.verifiedCount}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        color="purple"
                    />
                </div>

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
                            All ({dummyReceipts.length})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Active)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Active
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Active ({dummyDashboardStats.activeCount})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Stolen)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Stolen
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Stolen ({dummyDashboardStats.stolenCount})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Misplaced)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Misplaced
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Misplaced ({dummyDashboardStats.misplacedCount})
                        </button>
                        <button
                            onClick={() => setSelectedStatus(GadgetStatus.Recycled)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedStatus === GadgetStatus.Recycled
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Recycled ({dummyDashboardStats.recycledCount})
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
