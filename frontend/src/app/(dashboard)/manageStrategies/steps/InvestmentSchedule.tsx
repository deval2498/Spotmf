import React from "react";
import { StrategyFormState } from "../types";
import { INTERVAL_OPTIONS, AMOUNT_OPTIONS } from "../constants";

interface InvestmentScheduleProps {
  newStrategy: StrategyFormState;
  setNewStrategy: React.Dispatch<React.SetStateAction<StrategyFormState>>;
}

export const InvestmentSchedule: React.FC<InvestmentScheduleProps> = ({
  newStrategy,
  setNewStrategy,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-zinc-100">Investment Schedule</h3>

      <div className="space-y-4">
        {/* Interval Days */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Investment interval
          </label>
          <div className="flex gap-2">
            {INTERVAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setNewStrategy({
                    ...newStrategy,
                    intervalDays: option.value,
                  })
                }
                className={`px-3 py-2 rounded-lg border transition-all text-sm flex-1 ${
                  newStrategy.intervalDays === option.value
                    ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-[#ff6b6b]"
                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {option.label}
              </button>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Days"
                value={newStrategy.intervalDays || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setNewStrategy({
                    ...newStrategy,
                    intervalDays: value,
                  });
                }}
                className="w-16 px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm text-center focus:outline-none focus:border-[#ff6b6b] transition-colors placeholder-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Amount per Interval */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Amount per interval
          </label>
          <div className="flex gap-2 mb-2">
            {AMOUNT_OPTIONS.map((amount) => (
              <button
                key={amount}
                onClick={() =>
                  setNewStrategy({
                    ...newStrategy,
                    intervalAmount: amount,
                  })
                }
                className={`px-3 py-2 rounded-lg border transition-all text-sm flex-1 ${
                  newStrategy.intervalAmount === amount
                    ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-[#ff6b6b]"
                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <div className="relative w-32">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={newStrategy.intervalAmount || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setNewStrategy({
                  ...newStrategy,
                  intervalAmount: value,
                });
              }}
              className="w-full pl-6 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-[#ff6b6b] transition-colors placeholder-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Total Budget */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Total budget
            <span className="text-zinc-500 font-normal text-xs"> </span>
          </label>
          <div className="relative w-40">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={newStrategy.totalAmount || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setNewStrategy({
                  ...newStrategy,
                  totalAmount: value,
                });
              }}
              className="w-full pl-6 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-[#ff6b6b] transition-colors placeholder-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Amount for which you will sign the transaction
          </p>
        </div>

        {/* Summary */}
        {newStrategy.intervalAmount && newStrategy.intervalDays && (
          <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
            <p className="text-sm text-zinc-300">
              <span className="font-medium">Summary:</span> Investing $
              {newStrategy.intervalAmount} every {newStrategy.intervalDays} day
              {newStrategy.intervalDays !== "1" ? "s" : ""}
              {newStrategy.totalAmount && (
                <>
                  {" "}
                  for{" "}
                  {Math.floor(
                    Number(newStrategy.totalAmount) /
                      Number(newStrategy.intervalAmount)
                  )}{" "}
                  intervals
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
