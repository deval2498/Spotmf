import React from "react";
import { TrendingUp, Edit3, Trash2, Calendar, DollarSign } from "lucide-react";

interface StrategyCardProps {
  strategy: {
    id: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastExecutedAt: string | null;
    nextExecutionAt: string | null;
    totalAmountSwapped: string;
    totalExecutions: number;
    txHash: string;
    walletAddress: string;
    actionNonce: {
      asset: string;
      strategyType: string;
      totalAmount: string;
      intervalAmount: string;
      intervalDays: number;
      acceptedSlippage: string;
      action: string;
      createdAt: string;
      expiresAt: string;
    };
  };
  onEdit: (strategy: any) => void;
  onDelete: (id: string) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onEdit,
  onDelete,
}) => {
  // Helper function to format currency
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount) / 1000000;
    return `$${num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const totalAmount = parseFloat(strategy.actionNonce.totalAmount);
    const swappedAmount = parseFloat(strategy.totalAmountSwapped);
    return totalAmount > 0 ? (swappedAmount / totalAmount) * 100 : 0;
  };

  return (
    <div className="relative bg-black/20 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 max-w-sm">
      {/* Ultra-subtle glass highlight */}
      <div className="absolute inset-0 bg-white/[0.015] rounded-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <h3 className="text-base font-medium text-white/90 truncate">
              {strategy.actionNonce.asset}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-xl border ${
                strategy.isActive && strategy.status === "ACTIVE"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : strategy.status === "PENDING"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-white/5 text-zinc-300 border-white/10"
              }`}
            >
              {strategy.status}
            </span>
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
            DCA Strategy
          </p>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onEdit(strategy)}
            className="p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-xl transition-all duration-200 group"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white/90" />
          </button>
          <button
            onClick={() => onDelete(strategy.id)}
            className="p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-all duration-200 group"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="space-y-3 relative z-10">
        {/* Total & Per Interval */}
        <div className="relative bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-3 border border-white/[0.08]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-400 font-medium">Total</span>
            <span className="text-sm font-semibold text-white/90">
              {formatCurrency(strategy.actionNonce.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500">
              Per {strategy.actionNonce.intervalDays}d
            </span>
            <span className="text-xs text-zinc-300 font-medium">
              {formatCurrency(strategy.actionNonce.intervalAmount)}
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="relative bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-3 border border-white/[0.08]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-zinc-400 font-medium">Progress</span>
            <span className="text-xs text-zinc-300 font-medium">
              {getProgressPercentage().toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/30 backdrop-blur-sm rounded-full h-1.5 mb-2 overflow-hidden border border-white/5">
            <div
              className="bg-white/30 h-full transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-medium">
              {formatCurrency(strategy.totalAmountSwapped)}
            </span>
            <span className="text-zinc-500">
              {strategy.totalExecutions} executions
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500 font-medium">
              Created {formatDate(strategy.createdAt)}
            </span>
          </div>
          {strategy.nextExecutionAt && (
            <span className="text-zinc-400 font-medium">
              Next: {formatDate(strategy.nextExecutionAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
