"use client";
import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const ActivityTable = () => {
  // Sample transaction data
  const [transactions] = useState([
    {
      id: 1,
      txnHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      status: "confirmed",
      amount: 2.5,
      asset: "ETH",
    },
    {
      id: 2,
      txnHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
      status: "pending",
      amount: 1000,
      asset: "USDC",
    },
    {
      id: 3,
      txnHash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
      status: "failed",
      amount: 0.1,
      asset: "BTC",
    },
    {
      id: 4,
      txnHash: "0x4d5e6f7890abcdef1234567890abcdef12345678",
      status: "confirmed",
      amount: 500,
      asset: "USDT",
    },
    {
      id: 5,
      txnHash: "0x5e6f7890abcdef1234567890abcdef1234567890",
      status: "confirmed",
      amount: 0.75,
      asset: "ETH",
    },
    {
      id: 6,
      txnHash: "0x6f7890abcdef1234567890abcdef123456789012",
      status: "pending",
      amount: 250,
      asset: "DAI",
    },
    {
      id: 7,
      txnHash: "0x7890abcdef1234567890abcdef12345678901234",
      status: "confirmed",
      amount: 0.05,
      asset: "BTC",
    },
    {
      id: 8,
      txnHash: "0x890abcdef1234567890abcdef123456789012345",
      status: "failed",
      amount: 100,
      asset: "USDC",
    },
    {
      id: 9,
      txnHash: "0x90abcdef123456789012345678901234567890ab",
      status: "confirmed",
      amount: 1.2,
      asset: "ETH",
    },
    {
      id: 10,
      txnHash: "0xabcdef123456789012345678901234567890abcd",
      status: "pending",
      amount: 750,
      asset: "USDT",
    },
    {
      id: 11,
      txnHash: "0xbcdef123456789012345678901234567890abcde",
      status: "confirmed",
      amount: 0.3,
      asset: "BTC",
    },
    {
      id: 12,
      txnHash: "0xcdef123456789012345678901234567890abcdef",
      status: "confirmed",
      amount: 2000,
      asset: "DAI",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    asset: "all",
  });

  // Get unique assets for filter dropdown
  const uniqueAssets = [...new Set(transactions.map((tx) => tx.asset))];

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const statusMatch =
        filters.status === "all" || tx.status === filters.status;
      const assetMatch = filters.asset === "all" || tx.asset === filters.asset;
      return statusMatch && assetMatch;
    });
  }, [transactions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const formatTxnHash = (hash) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-600/20 via-slate-500/20 to-slate-700/20 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-3 bg-slate-800/20 rounded-lg">
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-2 py-1 bg-transparent border border-slate-600/30 rounded text-sm text-gray-300 focus:outline-none focus:border-slate-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.asset}
              onChange={(e) => handleFilterChange("asset", e.target.value)}
              className="px-2 py-1 bg-transparent border border-slate-600/30 rounded text-sm text-gray-300 focus:outline-none focus:border-slate-500"
            >
              <option value="all">All Assets</option>
              {uniqueAssets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left p-2 text-gray-300 font-semibold">
                Txn Hash
              </th>
              <th className="text-left p-2 text-gray-300 font-semibold">
                Status
              </th>
              <th className="text-right p-2 text-gray-300 font-semibold">
                Amount
              </th>
              <th className="text-left p-2 text-gray-300 font-semibold">
                Asset
              </th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
              >
                <td className="p-2">
                  <span className="font-mono text-blue-400 text-sm">
                    {formatTxnHash(tx.txnHash)}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span
                      className={`capitalize font-medium ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </td>
                <td className="p-2 text-right">
                  <span className="text-white font-semibold">
                    {tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-slate-700/50 text-gray-300 rounded-md text-sm font-medium">
                    {tx.asset}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/30">
        <div className="text-xs text-gray-500">
          {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of{" "}
          {filteredTransactions.length}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 hover:bg-slate-700/30 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-0.5 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-6 h-6 text-xs rounded transition-colors ${
                  currentPage === page
                    ? "bg-slate-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-slate-700/30"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 hover:bg-slate-700/30 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTable;
