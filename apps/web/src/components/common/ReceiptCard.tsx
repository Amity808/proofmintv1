import React from "react";
import { Receipt, QrCode, Eye, MoreVertical, CheckCircle, AlertTriangle, XCircle, Recycle } from "lucide-react";
import { GadgetStatus } from "@/types";

interface ReceiptCardProps {
    id: string;
    receipt?: {
        id: number;
        merchant: string;
        buyer: string;
        ipfsHash: string;
        timestamp: number;
        gadgetStatus: number;
        lastStatusUpdate: number;
    };
    onViewDetails: (id: string) => void;
    onGenerateQR: (id: string) => void;
    onUpdateStatus?: (id: string, status: GadgetStatus) => void;
}

const ReceiptCard: React.FC<ReceiptCardProps> = ({ id, receipt, onViewDetails, onGenerateQR, onUpdateStatus }) => {
    // Use real receipt data if available, otherwise fall back to mock data
    const receiptData = receipt || {
        id: parseInt(id),
        merchant: "0x0000000000000000000000000000000000000000",
        buyer: "0x0000000000000000000000000000000000000000",
        ipfsHash: "",
        timestamp: Date.now() / 1000,
        gadgetStatus: GadgetStatus.Active,
        lastStatusUpdate: Date.now() / 1000,
    };

    const mockReceipt = {
        id: receiptData.id,
        productName: "iPhone 15 Pro",
        productId: "IPH15PRO-001",
        purchaseDate: new Date(receiptData.timestamp * 1000).toLocaleDateString(),
        price: "999.99",
        currency: "USD",
        merchant: receiptData.merchant.slice(0, 6) + "..." + receiptData.merchant.slice(-4),
        transactionHash: "0x1234...5678",
        status: receiptData.gadgetStatus as GadgetStatus,
        ipfsHash: receiptData.ipfsHash,
        image: "/api/placeholder/300/200",
        description: "Latest iPhone with Pro camera system",
        specs: ["6.1-inch display", "A17 Pro chip", "48MP camera", "Titanium design"],
    };

    const getStatusInfo = (status: GadgetStatus) => {
        switch (status) {
            case GadgetStatus.Active:
                return {
                    icon: <CheckCircle className="w-4 h-4" />,
                    text: "Active",
                    color: "bg-green-100 text-green-800",
                    dotColor: "bg-green-500",
                };
            case GadgetStatus.Stolen:
                return {
                    icon: <XCircle className="w-4 h-4" />,
                    text: "Stolen",
                    color: "bg-red-100 text-red-800",
                    dotColor: "bg-red-500",
                };
            case GadgetStatus.Misplaced:
                return {
                    icon: <AlertTriangle className="w-4 h-4" />,
                    text: "Misplaced",
                    color: "bg-yellow-100 text-yellow-800",
                    dotColor: "bg-yellow-500",
                };
            case GadgetStatus.Recycled:
                return {
                    icon: <Recycle className="w-4 h-4" />,
                    text: "Recycled",
                    color: "bg-blue-100 text-blue-800",
                    dotColor: "bg-blue-500",
                };
            default:
                return {
                    icon: <CheckCircle className="w-4 h-4" />,
                    text: "Unknown",
                    color: "bg-gray-100 text-gray-800",
                    dotColor: "bg-gray-500",
                };
        }
    };

    const statusInfo = getStatusInfo(mockReceipt.status);

    return (
        <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
                <img
                    src={mockReceipt.image}
                    alt={mockReceipt.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/300x200/6366f1/ffffff?text=${encodeURIComponent(mockReceipt.productName)}`;
                    }}
                />
                <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></div>
                        {statusInfo.text}
                    </span>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{mockReceipt.productName}</h3>
                        <p className="text-sm text-gray-600 mb-2">{mockReceipt.merchant}</p>
                        <p className="text-xs text-gray-500">Receipt #{mockReceipt.id}</p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                {/* Price and Date */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-lg font-bold text-gray-900">${mockReceipt.price}</p>
                        <p className="text-xs text-gray-500">{mockReceipt.purchaseDate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Transaction</p>
                        <p className="text-xs font-mono text-gray-700">{mockReceipt.transactionHash}</p>
                    </div>
                </div>

                {/* Specs */}
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Specifications:</p>
                    <div className="flex flex-wrap gap-1">
                        {mockReceipt.specs.slice(0, 2).map((spec, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                            >
                                {spec}
                            </span>
                        ))}
                        {mockReceipt.specs.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                                +{mockReceipt.specs.length - 2} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onViewDetails(id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                    <button
                        onClick={() => onGenerateQR(id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <QrCode className="w-4 h-4" />
                    </button>
                </div>

                {/* Status Update Actions */}
                {onUpdateStatus && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Update Status:</p>
                        <div className="flex gap-1">
                            {Object.values(GadgetStatus)
                                .filter((status) => typeof status === "number")
                                .map((status) => {
                                    const statusInfo = getStatusInfo(status as GadgetStatus);
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => onUpdateStatus(id, status as GadgetStatus)}
                                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${mockReceipt.status === status
                                                ? statusInfo.color
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            {statusInfo.icon}
                                            {statusInfo.text}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiptCard;
