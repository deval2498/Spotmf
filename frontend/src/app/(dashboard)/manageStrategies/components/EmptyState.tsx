import React from "react";
import { Target, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center py-12">
      <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">
        No strategies yet
      </h3>
      <p className="text-zinc-500 mb-6">
        Create your first investment strategy to get started
      </p>
      <button
        onClick={onCreateClick}
        className="px-6 py-3 bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white rounded-lg transition-colors inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Strategy
      </button>
    </div>
  );
};
