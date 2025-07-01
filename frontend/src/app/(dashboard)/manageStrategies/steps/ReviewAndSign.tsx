import React from "react";
import { StrategyFormState } from "../types";

interface ReviewAndSignProps {
  newStrategy: StrategyFormState;
}

export const ReviewAndSign: React.FC<ReviewAndSignProps> = ({
  newStrategy,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-zinc-100">Review and Sign</h3>
      <div className="bg-zinc-800/50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-400">Asset Type:</span>{" "}
            <span className="text-zinc-100">{newStrategy.asset}</span>
          </div>
          <div>
            <span className="text-zinc-400">Strategy Type:</span>{" "}
            <span className="text-zinc-100">{newStrategy.strategyType}</span>
          </div>
          <div>
            <span className="text-zinc-400">Interval Days:</span>{" "}
            <span className="text-zinc-100">{newStrategy.intervalDays}</span>
          </div>
          <div>
            <span className="text-zinc-400">Amount:</span>
            {newStrategy.intervalAmount}
          </div>
        </div>
        <div>
          <span className="text-zinc-400 text-sm">
            Total Amount: {newStrategy.totalAmount}
          </span>
        </div>
      </div>
    </div>
  );
};
