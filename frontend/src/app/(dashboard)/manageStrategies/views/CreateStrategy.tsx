import React from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { StrategyFormState, FormErrors } from "../types";
import { CREATE_STEPS } from "../constants";
import { StepIndicator } from "../components/StepIndicator";
import { StrategyBasics } from "../steps/StrategyBasics";
import { InvestmentSchedule } from "../steps/InvestmentSchedule";
import { ReviewAndSign } from "../steps/ReviewAndSign";

interface CreateStrategyProps {
  currentStep: number;
  newStrategy: StrategyFormState;
  formErrors: FormErrors;
  loading: boolean;
  onStepChange: (step: number) => void;
  onStrategyChange: React.Dispatch<React.SetStateAction<StrategyFormState>>;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  onCreateStrategy: () => void;
}

export const CreateStrategy: React.FC<CreateStrategyProps> = ({
  currentStep,
  newStrategy,
  formErrors,
  loading,
  onStepChange,
  onStrategyChange,
  onBack,
  onNext,
  onPrev,
  onCreateStrategy,
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StrategyBasics
            newStrategy={newStrategy}
            setNewStrategy={onStrategyChange}
            formErrors={formErrors}
          />
        );
      case 1:
        return (
          <InvestmentSchedule
            newStrategy={newStrategy}
            setNewStrategy={onStrategyChange}
          />
        );
      case 2:
        return <ReviewAndSign newStrategy={newStrategy} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              Create New Strategy
            </h1>
            <p className="text-zinc-400 mt-1">
              Step {currentStep + 1} of {CREATE_STEPS.length}
            </p>
          </div>
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6 border-b border-zinc-800">
        <StepIndicator steps={CREATE_STEPS} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="p-6 flex-1">
        <div className="max-w-2xl">{renderStep()}</div>
      </div>

      {/* Navigation */}
      <div className="border-t border-zinc-800 p-6">
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-zinc-400 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={
              currentStep === CREATE_STEPS.length - 1
                ? onCreateStrategy
                : onNext
            }
            disabled={loading}
            className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
              loading
                ? "bg-zinc-600 cursor-not-allowed"
                : "bg-[#ff6b6b] hover:bg-[#ff6b6b]/90"
            }`}
          >
            {currentStep === CREATE_STEPS.length - 1 ? (
              loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  Create Strategy
                  <ArrowRight className="w-4 h-4" />
                </>
              )
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
