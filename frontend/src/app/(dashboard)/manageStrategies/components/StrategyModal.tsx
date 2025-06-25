import React, { useState } from "react";
import { X, Check, Loader2, FileText, Send } from "lucide-react";

const StrategyModal = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Status, setStep1Status] = useState("pending"); // pending, loading, completed
  const [step2Status, setStep2Status] = useState("pending"); // pending, loading, completed

  const handleStep1 = async () => {
    setStep1Status("loading");
    // Simulate message signing process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep1Status("completed");
    setCurrentStep(2);
  };

  const handleStep2 = async () => {
    setStep2Status("loading");
    // Simulate transaction signing process
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setStep2Status("completed");
    // Auto close after completion
    setTimeout(() => {
      onClose();
      onComplete && onComplete();
      resetModal();
    }, 1500);
  };

  const resetModal = () => {
    setCurrentStep(1);
    setStep1Status("pending");
    setStep2Status("pending");
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const getStepIcon = (step, status) => {
    if (status === "loading")
      return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status === "completed") return <Check className="w-4 h-4" />;
    return step === 1 ? (
      <FileText className="w-4 h-4" />
    ) : (
      <Send className="w-4 h-4" />
    );
  };

  const getStepColor = (step, status) => {
    if (status === "completed") return "bg-green-500";
    if (status === "loading")
      return "bg-gradient-to-r from-pink-500 to-red-500";
    if (currentStep === step)
      return "bg-gradient-to-r from-pink-500 to-red-500";
    return "bg-zinc-600";
  };

  const getConnectorColor = () => {
    if (step1Status === "completed") return "bg-green-500";
    return "bg-zinc-600";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-800/80 rounded-lg p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">
            Create Strategy
          </h2>
          <p className="text-zinc-400 text-sm">
            Complete both steps to create your strategy
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStepColor(
                  1,
                  step1Status
                )}`}
              >
                {getStepIcon(1, step1Status)}
              </div>
              <div className={`w-px h-12 mt-2 ${getConnectorColor()}`}></div>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-sm font-medium text-white mb-1">
                Sign Message
              </h3>
              <p className="text-zinc-400 text-xs mb-3">
                Verify wallet ownership
              </p>
              {currentStep === 1 && step1Status === "pending" && (
                <button
                  onClick={handleStep1}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
                >
                  Sign Message
                </button>
              )}
              {step1Status === "loading" && (
                <div className="text-pink-400 text-xs">
                  Waiting for signature...
                </div>
              )}
              {step1Status === "completed" && (
                <div className="text-green-400 text-xs">
                  ✓ Signed successfully
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStepColor(
                  2,
                  step2Status
                )}`}
              >
                {getStepIcon(2, step2Status)}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-sm font-medium text-white mb-1">
                Sign Transaction
              </h3>
              <p className="text-zinc-400 text-xs mb-3">
                Create strategy on-chain
              </p>
              {currentStep === 2 && step2Status === "pending" && (
                <button
                  onClick={handleStep2}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200"
                >
                  Sign Transaction
                </button>
              )}
              {step2Status === "loading" && (
                <div className="text-pink-400 text-xs">
                  Processing transaction...
                </div>
              )}
              {step2Status === "completed" && (
                <div className="text-green-400 text-xs">
                  ✓ Strategy created!
                </div>
              )}
              {currentStep < 2 && step1Status !== "completed" && (
                <div className="text-zinc-500 text-xs">
                  Complete step 1 first
                </div>
              )}
            </div>
          </div>
        </div>

        {step2Status === "completed" && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
            <p className="text-green-400 text-xs text-center">
              Strategy created successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyModal;
