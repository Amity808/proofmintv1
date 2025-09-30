// Core data types for My Celo App dashboard

export enum GadgetStatus {
    Active = 0,
    Stolen = 1,
    Misplaced = 2,
    Recycled = 3,
}

export interface Receipt {
    id: number;
    productName: string;
    productId: string;
    purchaseDate: string;
    price: string;
    currency: string;
    merchant: string;
    transactionHash: string;
    status: GadgetStatus;
    ipfsHash: string;
    image: string;
    description?: string;
    specs?: string[];
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    merchant: string;
    category: string;
    image: string;
    inStock: boolean;
    specs: string[];
    rating?: number;
    reviews?: number;
}

export interface User {
    address: string;
    role: "buyer" | "merchant" | "recycler" | "admin";
    name?: string;
    email?: string;
}

export interface Merchant {
    address: string;
    name: string;
    verified: boolean;
    totalReceipts: number;
    revenue: number;
    joinDate: string;
}

export interface Recycler {
    address: string;
    name: string;
    verified: boolean;
    totalRecycled: number;
    environmentalImpact: number;
    joinDate: string;
}

export interface DashboardStats {
    totalReceipts: number;
    totalSpent: number;
    verifiedCount: number;
    activeCount: number;
    stolenCount: number;
    misplacedCount: number;
    recycledCount: number;
}

export interface MerchantStats {
    totalReceiptsIssued: number;
    totalRevenue: number;
    activeProducts: number;
    recentReceipts: number;
}

export interface RecyclerStats {
    totalRecycled: number;
    environmentalImpact: number;
    availableForRecycling: number;
    pendingRecycling: number;
}

export interface AdminStats {
    totalUsers: number;
    totalMerchants: number;
    totalRecyclers: number;
    totalReceipts: number;
    systemHealth: "good" | "warning" | "critical";
}

// Component prop types
export interface ReceiptCardProps {
    id: string;
    onViewDetails: (id: string) => void;
    onGenerateQR: (id: string) => void;
    onUpdateStatus?: (id: string, status: GadgetStatus) => void;
}

export interface ProductCardProps {
    product: Product;
    onBuy: (id: number) => void;
    onViewDetails: (id: number) => void;
}

export interface StatusBadgeProps {
    status: GadgetStatus;
    size?: "sm" | "md" | "lg";
}

export interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "green" | "blue" | "purple" | "red" | "yellow" | "gray";
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export interface WalletConnectionProps {
    onConnect: () => void;
    onDisconnect: () => void;
    isConnected: boolean;
    address?: string;
}

export interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionHash?: string;
    status: "pending" | "success" | "error";
    message?: string;
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// Filter and search types
export interface ProductFilters {
    category?: string;
    priceRange?: {
        min: number;
        max: number;
    };
    merchant?: string;
    inStock?: boolean;
    rating?: number;
}

export interface ReceiptFilters {
    status?: GadgetStatus;
    merchant?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}

export interface SearchParams {
    query?: string;
    filters?: ProductFilters | ReceiptFilters;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
}
