import { StrategyCard } from "../components/StrategyCard";

// Update StrategyList component props
interface StrategyListProps {
  strategies: Strategy[] | undefined;
  activeTab: "live" | "pending";
  onTabChange: (tab: "live" | "pending") => void;
  onCreateClick: () => void;
  onEdit: (strategy: Strategy) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  error: any;
  onRetry: () => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  activeTab,
  onTabChange,
  onCreateClick,
  onEdit,
  onDelete,
  loading,
  error,
  onRetry,
}) => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100">Your Strategies</h2>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Create Strategy
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-zinc-900/50 backdrop-blur-sm p-1 rounded-xl mb-6 border border-white/[0.08]">
        <button
          onClick={() => onTabChange("live")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "live"
              ? "bg-white/10 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-300 hover:bg-white/[0.05]"
          }`}
        >
          Live Strategies
        </button>
        <button
          onClick={() => onTabChange("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "pending"
              ? "bg-white/10 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-300 hover:bg-white/[0.05]"
          }`}
        >
          Pending Approval
        </button>
      </div>

      {/* Strategy Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">Error loading strategies</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {strategies?.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!strategies || strategies.length === 0) && (
        <div className="text-center py-12">
          <p className="text-zinc-400 text-lg mb-4">
            {activeTab === "live"
              ? "No live strategies yet"
              : "No pending strategies"}
          </p>
          <p className="text-zinc-500 text-sm">
            {activeTab === "live"
              ? "Create your first strategy to get started"
              : "All your strategies are confirmed and running"}
          </p>
        </div>
      )}
    </div>
  );
};
