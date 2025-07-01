import React from "react";
import { StrategyFormState, FormErrors } from "../types";
import { ASSET_OPTIONS, STRATEGY_OPTIONS } from "../constants";

interface StrategyBasicsProps {
  newStrategy: StrategyFormState;
  setNewStrategy: React.Dispatch<React.SetStateAction<StrategyFormState>>;
  formErrors: FormErrors;
}

export const StrategyBasics: React.FC<StrategyBasicsProps> = ({
  newStrategy,
  setNewStrategy,
  formErrors,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-zinc-100">Strategy Basics</h3>
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-zinc-300">
            Select Asset Type
          </label>
          {formErrors.asset && (
            <p className="text-sm text-red-400">{formErrors.asset}</p>
          )}

          <div className="flex gap-2">
            {ASSET_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm
                  ${
                    newStrategy.asset === option.symbol
                      ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-zinc-100"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="asset"
                  value={option.symbol}
                  checked={newStrategy.asset === option.symbol}
                  onChange={(e) =>
                    setNewStrategy({
                      ...newStrategy,
                      asset: e.target.value,
                    })
                  }
                  className="sr-only"
                />
                <span className="text-xs">{option.icon}</span>
                <span className="font-medium">{option.symbol}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300">
              Select Strategy Type
            </label>

            <div className="grid grid-cols-2 gap-3">
              {STRATEGY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                    ${
                      newStrategy.strategyType === option.value
                        ? "border-[#ff6b6b] bg-gradient-to-br from-[#ff6b6b]/10 to-[#ff6b6b]/5 shadow-lg shadow-[#ff6b6b]/20"
                        : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/70"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="strategyType"
                    value={option.value}
                    checked={newStrategy.strategyType === option.value}
                    onChange={(e) =>
                      setNewStrategy({
                        ...newStrategy,
                        strategyType: e.target.value,
                      })
                    }
                    className="sr-only"
                  />

                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-zinc-100 mb-1">
                    {option.label}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {option.description}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
