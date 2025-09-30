"use client";

import React, { useEffect, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Globe, Plus, Receipt, Store, Upload, X } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { CONTRACT_CONFIG } from "@/utils/selfProtocol";
import proofmintAbi from "@/contract/abi.json";
import { makeContractMetadata } from "@/utils/UploadPinta";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import StatsCard from "@/components/merchant/StatsCard";
import AllReceipts from "@/components/merchant/AllReceipts";
import SubscriptionManager from "@/components/merchant/SubscriptionManager";
import FundWallet from "@/components/merchant/FundWallet";
import { useMerchantReceipts } from "@/hooks/useAllReceipts";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";

// Contract address - you may need to update this
const CONTRACT_ADDRESS = "0xd18793cA49171cD6eD7E03fC4C73dC6354D09ebf";

const MerchantDashboard: React.FC = () => {
    const { isConnected, address } = useAccount();
    const [activeTab, setActiveTab] = useState<"overview" | "receipts" | "products" | "subscription">("overview");
    const [isMounted, setIsMounted] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showFundWallet, setShowFundWallet] = useState(false);
    const [merchantLabel, setMerchantLabel] = useState("");
    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        specs: "",
        image: null as File | null,
        serial_number: "",
        buyerAddress: "",
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Contract interaction hooks
    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Check if user is a verified merchant
    const { data: isMerchant } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'isVerifiedMerchant',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Check if user can issue receipts
    const { data: canIssueReceipts } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'canIssueReceipts',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Get merchant receipts
    const { data: merchantReceiptIds } = useReadContract({
        address: CONTRACT_CONFIG.address as `0x${string}`,
        abi: proofmintAbi,
        functionName: 'getMerchantReceipts',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        },
    });

    // Callback to refresh data when subscription is updated
    const handleSubscriptionUpdate = () => {
        // Trigger re-fetch of merchant status and receipts capability
        window.location.reload(); // Simple refresh for now
    };

    const merchantStatus = isMerchant as boolean | undefined;
    const canIssue = canIssueReceipts as boolean | undefined;

    // Handle hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Get real merchant receipts from contract
    const { receipts: merchantReceipts, isLoading: isLoadingReceipts } = useMerchantReceipts(address);

    // Get USDC balance
    const { balance: usdcBalance, isLoading: isLoadingBalance } = useUSDCBalance();

    // Calculate real stats from contract data
    const merchantStats = {
        totalReceiptsIssued: merchantReceipts.length,
        totalRevenue: 0, // This would need to be calculated from actual transaction data
        activeProducts: merchantReceipts.filter(r => r.gadgetStatus === 0).length,
        recentReceipts: merchantReceipts.filter(r => {
            const receiptDate = new Date(r.timestamp * 1000);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return receiptDate > weekAgo;
        }).length,
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                setMessage("❌ Please select an image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage("❌ Image size must be less than 5MB");
                return;
            }

            setNewProduct(prev => ({ ...prev, image: file }));

            // Create preview
            const reader = new FileReader();
            reader.onload = e => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setNewProduct(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleReceipt = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsUploading(true);
        setMessage('');


        try {
            if (!newProduct.image) {
                setMessage('❌ Please upload a product image');
                setIsUploading(false);
                return;
            }

            if (!newProduct.buyerAddress) {
                setMessage('❌ Please enter buyer address');
                setIsUploading(false);
                return;
            }

            if (!merchantStatus) {
                setMessage('❌ You are not a verified merchant');
                setIsUploading(false);
                return;
            }

            if (!canIssue) {
                setMessage('❌ You cannot issue receipts. Check your subscription status.');
                setIsUploading(false);
                return;
            }

            // Upload to IPFS using Pinata
            const ipfsHash = await makeContractMetadata({
                imageFile: newProduct.image,
                recipt: newProduct.name,
                description: newProduct.description,
                serial_number: newProduct.serial_number,
                spec: newProduct.specs,
            });

            // Issue receipt on contract
            await writeContract({
                address: CONTRACT_CONFIG.address as `0x${string}`,
                abi: proofmintAbi,
                functionName: 'issueReceipt',
                args: [newProduct.buyerAddress as `0x${string}`, ipfsHash],
            });

        } catch (error) {
            setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsUploading(false);
        }
    };

    // Reset form when transaction succeeds
    React.useEffect(() => {
        if (isSuccess) {
            setMessage('✅ Receipt issued successfully!');
            // Reset form
            setNewProduct({
                name: "",
                description: "",
                price: "",
                category: "",
                specs: "",
                image: null,
                serial_number: "",
                buyerAddress: "",
            });
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else if (error) {
            setMessage(`❌ Transaction failed: ${error.message}`);
        }
    }, [isSuccess, error]);

    const handleRegisterMerchant = async () => {
        if (!merchantLabel.trim()) return;

        try {
            console.log("Registering merchant with:", {
                label: merchantLabel.trim(),
                address: address,
            });

            // TODO: Implement actual merchant registration
            console.log("Merchant registration successful");
            setShowRegisterModal(false);
            setMerchantLabel("");
        } catch (error) {
            console.error("Error registering merchant:", error);
        }
    };

    // Show loading state during hydration
    if (!isMounted) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading merchant dashboard...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Merchant Dashboard</h1>
                        <p className="text-gray-600 mb-6">Connect your wallet to manage your store</p>
                        <ConnectButton />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Check if user is a verified merchant
    const hasDomain = merchantStatus; // Show merchant dashboard only if verified merchant

    if (!hasDomain) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Store className="w-10 h-10 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Merchant Verification Required</h1>
                        <p className="text-gray-600 mb-6">
                            You need to be verified as a merchant to access the merchant dashboard. Contact the admin to get verified as a merchant.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Globe className="w-4 h-4" />
                                <span>Get verified as a merchant</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Receipt className="w-4 h-4" />
                                <span>Issue digital receipts for products</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Store className="w-4 h-4" />
                                <span>Access merchant features</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowRegisterModal(true)}
                            className="mt-8 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Register Merchant
                        </button>
                    </div>
                </div>
                <Footer />

                {/* Register Merchant Modal */}
                {showRegisterModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Store className="w-6 h-6 text-blue-600" />
                                    Register Merchant
                                </h3>
                                <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                    <input
                                        type="text"
                                        value={merchantLabel}
                                        onChange={e => setMerchantLabel(e.target.value)}
                                        placeholder="Enter your business name (e.g., 'mystore')"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        This will register your merchant account
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        onClick={handleRegisterMerchant}
                                        disabled={!merchantLabel.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Register Merchant
                                    </button>
                                    <button
                                        onClick={() => setShowRegisterModal(false)}
                                        className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Merchant Dashboard
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-600">Manage your products and track receipts</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${merchantStatus
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    <Store className="w-3 h-3" />
                                    {merchantStatus ? 'Verified Merchant' : 'Not Verified'}
                                </div>
                                {canIssue && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        <Receipt className="w-3 h-3" />
                                        Can Issue Receipts
                                    </div>
                                )}
                                {address && (
                                    <div className="text-sm text-gray-500">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-100 rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: "overview", label: "Overview" },
                                { id: "receipts", label: "Receipts" },
                                { id: "products", label: "Products" },
                                { id: "subscription", label: "Subscription" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard
                                title="Total Receipts Issued"
                                value={merchantStats.totalReceiptsIssued}
                                icon={<Receipt className="w-6 h-6" />}
                                color="green"
                            />
                            <StatsCard
                                title="Total Revenue"
                                value={`$${merchantStats.totalRevenue.toLocaleString()}`}
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
                                title="Active Products"
                                value={merchantStats.activeProducts}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                }
                                color="purple"
                            />
                            <StatsCard
                                title="Recent Receipts"
                                value={merchantStats.recentReceipts}
                                icon={
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                }
                                color="yellow"
                            />
                        </div>

                        {/* USDC Balance and Funding */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">USDC Balance</h3>
                                        <p className="text-sm text-gray-600">Your wallet balance for subscriptions</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowFundWallet(true)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Fund Wallet</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {isLoadingBalance ? "Loading..." : `$${usdcBalance.toFixed(2)}`}
                                    </p>
                                    <p className="text-sm text-gray-600">USDC Available</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Subscription Costs:</p>
                                    <p className="text-xs text-gray-500">Basic: $10 • Premium: $50 • Enterprise: $100</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {merchantReceipts.slice(0, 5).map(receipt => {
                                    const status = receipt.gadgetStatus === 0 ? "Active" :
                                        receipt.gadgetStatus === 1 ? "Stolen" :
                                            receipt.gadgetStatus === 2 ? "Misplaced" : "Recycled";
                                    const statusColor = receipt.gadgetStatus === 0 ? "text-green-600" :
                                        receipt.gadgetStatus === 1 ? "text-red-600" :
                                            receipt.gadgetStatus === 2 ? "text-yellow-600" : "text-blue-600";

                                    return (
                                        <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                    <Receipt className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Receipt #{receipt.id}</p>
                                                    <p className="text-sm text-gray-600">Buyer: {receipt.buyer.slice(0, 6)}...{receipt.buyer.slice(-4)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold ${statusColor}`}>{status}</p>
                                                <p className="text-sm text-gray-600">{new Date(receipt.timestamp * 1000).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Receipts Tab */}
                {activeTab === "receipts" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">All Receipts</h3>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    placeholder="Search receipts..."
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* All receipt display */}
                        <AllReceipts receipts={merchantReceipts} isLoading={isLoadingReceipts} />
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === "products" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Product Management</h3>
                            <button
                                onClick={() => setActiveTab("products")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Product
                            </button>
                        </div>

                        {/* Add Product Form */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h4 className="text-lg font-medium mb-4">Issue Receipt</h4>

                            {/* Status Messages */}
                            {message && (
                                <div className={`mb-4 p-3 rounded-md ${message.includes('Error') || message.includes('failed')
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {message}
                                </div>
                            )}

                            {/* Merchant Status Warning */}
                            {!merchantStatus && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ You are not a verified merchant. Contact admin to get verified.
                                    </p>
                                </div>
                            )}

                            {merchantStatus && !canIssue && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ You cannot issue receipts. Check your subscription status.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={e => handleReceipt(e)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        value={newProduct.name}
                                        onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Smartphones">Smartphones</option>
                                        <option value="Laptops">Laptops</option>
                                        <option value="Tablets">Tablets</option>
                                        <option value="Audio">Audio</option>
                                        <option value="Gaming">Gaming</option>
                                        <option value="Wearables">Wearables</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                                    <input
                                        type="text"
                                        value={newProduct.serial_number}
                                        onChange={e => setNewProduct(prev => ({ ...prev, serial_number: e.target.value }))}
                                        placeholder="e.g., ABC123456789"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Address</label>
                                    <input
                                        type="text"
                                        value={newProduct.buyerAddress}
                                        onChange={e => setNewProduct(prev => ({ ...prev, buyerAddress: e.target.value }))}
                                        placeholder="0x..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Specifications (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={newProduct.specs}
                                        onChange={e => setNewProduct(prev => ({ ...prev, specs: e.target.value }))}
                                        placeholder="e.g., 6.1-inch display, A17 Pro chip"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>

                                    {!imagePreview ? (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center space-y-2">
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Upload className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Upload Product Image</p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                                </div>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                                <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {newProduct.image?.name} ({((newProduct.image?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        type="submit"
                                        disabled={isUploading || isPending || isConfirming || !merchantStatus || !canIssue}
                                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {isUploading || isPending || isConfirming ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>{isUploading ? 'Uploading...' : 'Processing...'}</span>
                                            </>
                                        ) : (
                                            <span>Issue Receipt</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Existing Products */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h4 className="text-lg font-medium mb-4">Your Products</h4>
                            <div className="text-center py-8 text-gray-500">
                                <p>No products added yet. Add your first product above.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscription Tab */}
                {activeTab === "subscription" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Subscription Management</h3>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${canIssue
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {canIssue ? '✅ Can Issue Receipts' : '❌ Cannot Issue Receipts'}
                            </div>
                        </div>

                        <SubscriptionManager
                            onSubscriptionUpdate={handleSubscriptionUpdate}
                            onFundWallet={() => setShowFundWallet(true)}
                        />
                    </div>
                )}
            </main>
            <Footer />

            {/* Fund Wallet Modal */}
            {showFundWallet && (
                <FundWallet
                    onSuccess={() => {
                        setShowFundWallet(false);
                        // Optionally refresh balance or show success message
                    }}
                    onClose={() => setShowFundWallet(false)}
                    defaultAmount="50"
                />
            )}
        </div>
    );
};

export default MerchantDashboard;
