import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Strategy } from "../types";

interface EditStrategyProps {
  strategy: Strategy | null;
  onBack: () => void;
  onSave: (strategy: Strategy) => void;
}

export const EditStrategy: React.FC<EditStrategyProps> = ({
  strategy,
  onBack,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    type: "growth",
    allocation: "",
    performance: "",
  });

  useEffect(() => {
    if (strategy) {
      setFormData({
        name: strategy.name || "",
        status: strategy.status?.toLowerCase() || "active",
        type: "growth", // You might want to map this from strategy.type
        allocation: strategy.allocation || "",
        performance: strategy.performance || "",
      });
    }
  }, [strategy]);

  const handleSave = () => {
    if (strategy) {
      onSave({
        ...strategy,
        name: formData.name,
        status:
          formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
        allocation: formData.allocation,
        performance: formData.performance,
      });
    }
  };

  return (
    <div className="h-full text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-zinc-100">Edit Strategy</h1>
        <button
          onClick={onBack}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <div className="max-w-4xl">
        <div className="bg-zinc-800/50 rounded-xl p-6">
          <h2 className="text-xl font-medium text-zinc-100 mb-6">
            {strategy?.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Strategy Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors"
                >
                  <option value="growth">Growth</option>
                  <option value="income">Income</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Allocation
                </label>
                <textarea
                  value={formData.allocation}
                  onChange={(e) =>
                    setFormData({ ...formData, allocation: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Performance
                </label>
                <input
                  type="text"
                  value={formData.performance}
                  onChange={(e) =>
                    setFormData({ ...formData, performance: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onBack}
              className="px-6 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#f6339a] hover:bg-[#f6339a]/90 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
