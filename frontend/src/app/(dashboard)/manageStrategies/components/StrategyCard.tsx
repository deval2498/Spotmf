import React from "react";
import { Edit3, Trash2, TrendingUp, BarChart3, Clock } from "lucide-react";
import { Strategy } from "../types";

interface StrategyCardProps {
  strategy: Strategy;
  onEdit: (strategy: Strategy) => void;
  onDelete: (id: number) => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-zinc-100">
              {strategy.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                strategy.status === "Active"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              {strategy.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Type:</span>
              <span className="text-sm text-zinc-100">{strategy.type}</span>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Performance:</span>
              <span
                className={`text-sm font-medium ${
                  strategy.performance.startsWith("+")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {strategy.performance}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Modified:</span>
              <span className="text-sm text-zinc-100">
                {strategy.lastModified}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-sm text-zinc-400">Allocation: </span>
            <span className="text-sm text-zinc-100">{strategy.allocation}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(strategy)}
            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors group"
            title="Edit Strategy"
          >
            <Edit3 className="w-4 h-4 text-zinc-400 group-hover:text-[#f6339a]" />
          </button>
          <button
            onClick={() => onDelete(strategy.id)}
            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors group"
            title="Delete Strategy"
          >
            <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
