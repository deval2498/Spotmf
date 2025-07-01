import React from "react";
import { Plus } from "lucide-react";
import { Strategy } from "../types";
import { StrategyCard } from "../components/StrategyCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";

interface StrategyListProps {
  strategies: Strategy[];
  onCreateClick: () => void;
  onEdit: (strategy: Strategy) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  onCreateClick,
  onEdit,
  onDelete,
  loading = false,
}) => {
  return (
    <div className="h-full text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              Manage Strategies
            </h1>
            <p className="text-zinc-400 mt-1">
              Create, edit, and monitor your investment strategies
            </p>
          </div>
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Strategy
          </button>
        </div>
      </div>

      {/* Strategy List */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
            <span className="ml-2 text-zinc-400">Loading strategies...</span>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {strategies.map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>

            {strategies.length === 0 && (
              <EmptyState onCreateClick={onCreateClick} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
