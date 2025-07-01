import React from "react";
import { ArrowRight } from "lucide-react";
import { CreateStep } from "../types";

interface StepIndicatorProps {
  steps: CreateStep[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                isActive
                  ? "border-[#ff6b6b] bg-[#ff6b6b] text-white"
                  : isCompleted
                  ? "border-[#f6339a] bg-[#f6339a] text-white"
                  : "border-zinc-600 bg-zinc-800 text-zinc-400"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={`ml-2 text-sm ${
                isActive
                  ? "text-[#ff6b6b]"
                  : isCompleted
                  ? "text-[#f6339a]"
                  : "text-zinc-400"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-zinc-600 ml-4" />
            )}
          </div>
        );
      })}
    </div>
  );
};
