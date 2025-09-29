import React from "react";
import { Receipt, ExternalLink, Download, Eye } from "lucide-react";

// Contract Receipt interface
interface ContractReceipt {
    id: number;
    merchant: string;
    buyer: string;
    ipfsHash: string;
    timestamp: number;
    gadgetStatus: number; // 0: Active, 1: Stolen, 2: Misplaced, 3: Recycled
    lastStatusUpdate: number;
}

interface AllReceiptsProps {
    receipts: ContractReceipt[];
    isLoading?: boolean;
}

const AllReceipts: React.FC<AllReceiptsProps> = ({ receipts, isLoading }) => {
    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getGadgetStatus = (status: number) => {
        switch (status) {
            case 0:
                return { text: "Active", color: "bg-green-100 text-green-800" };
            case 1:
                return { text: "Stolen", color: "bg-red-100 text-red-800" };
            case 2:
                return { text: "Misplaced", color: "bg-yellow-100 text-yellow-800" };
            case 3:
                return { text: "Recycled", color: "bg-blue-100 text-blue-800" };
            default:
                return { text: "Unknown", color: "bg-gray-100 text-gray-800" };
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading receipts...</p>
                </div>
            </div>
        );
    }

    if (receipts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Receipts Found</h3>
                    <p className="text-gray-500">You haven't issued any receipts yet. Start by adding a product.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Receipt ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Buyer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                IPFS Hash
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Updated
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {receipts.map((receipt) => {
                            const status = getGadgetStatus(receipt.gadgetStatus);
                            return (
                                <tr key={receipt.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <Receipt className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">#{receipt.id}</div>
                                                <div className="text-sm text-gray-500">Receipt</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-mono">{formatAddress(receipt.buyer)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 font-mono max-w-xs truncate">
                                            {receipt.ipfsHash}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(receipt.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(receipt.lastStatusUpdate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                onClick={() => window.open(`https://ipfs.io/ipfs/${receipt.ipfsHash}`, '_blank')}
                                                title="View IPFS metadata"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                                onClick={() => {
                                                    const link = `https://ipfs.io/ipfs/${receipt.ipfsHash}`;
                                                    window.open(link, '_blank');
                                                }}
                                                title="Download metadata"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-gray-600 hover:text-gray-900 p-1 rounded"
                                                onClick={() => {
                                                    const explorerUrl = `https://alfajores.celoscan.io/tx/${receipt.id}`;
                                                    window.open(explorerUrl, '_blank');
                                                }}
                                                title="View on CeloScan"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllReceipts;
