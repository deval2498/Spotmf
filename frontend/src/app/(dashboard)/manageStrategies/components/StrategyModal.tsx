import React, { useState, useEffect, useCallback } from "react";
import { X, Check, Loader2, FileText, Send } from "lucide-react";
import { useSignMessage, useAccount, useSendTransaction } from "wagmi";
import { useApi } from "@/hooks/useApi";

// Types
type StepStatus = "pending" | "loading" | "completed" | "error";

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  messageData: string | null;
}

interface StepIconProps {
  step: number;
  status: StepStatus;
}

interface StepColorProps {
  step: number;
  status: StepStatus;
  currentStep: number;
}

const StrategyModal: React.FC<StrategyModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  messageData,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");

  const { address, isConnected } = useAccount();
  const {
    signMessage,
    isPending,
    isSuccess,
    error,
    data: signedData,
    reset: resetSignature,
  } = useSignMessage();

  const {
    sendTransaction,
    isPending: isTransactionPending,
    isSuccess: isTransactionSuccess,
    error: transactionError,
    data: transactionHash,
    reset: resetTransaction,
  } = useSendTransaction();

  const verifyCreateStrategyNonceApi = useApi();

  // Handle successful signature
  useEffect(() => {
    if (isSuccess && signedData && step1Status === "loading") {
      setStep1Status("completed");
      setCurrentStep(2);
      console.log("Message signed successfully:", signedData);
      (async () => {
        await verifyCreateStrategyNonceApi.execute({
          url: "/auth/verify-action",
          method: "post",
          data: {
            signature: signedData,
            message: messageData.message,
          },
        });
      })();
    }
  }, [
    isSuccess,
    signedData,
    step1Status,
    messageData,
    verifyCreateStrategyNonceApi,
  ]);

  // Handle signature error
  useEffect(() => {
    if (error && step1Status === "loading") {
      setStep1Status("error");
      console.error("Signature error:", error);
    }
  }, [error, step1Status]);

  // Handle loading state from wagmi hook
  useEffect(() => {
    if (isPending && step1Status !== "loading") {
      setStep1Status("loading");
    }
  }, [isPending, step1Status]);

  // Handle transaction loading state
  useEffect(() => {
    if (isTransactionPending && step2Status !== "loading") {
      setStep2Status("loading");
    }
  }, [isTransactionPending, step2Status]);

  // Handle successful transaction
  useEffect(() => {
    if (isTransactionSuccess && transactionHash && step2Status === "loading") {
      setStep2Status("completed");
      console.log("Transaction sent successfully:", transactionHash);

      // Auto close after completion
      setTimeout(() => {
        onClose();
        onComplete?.();
        resetModal();
      }, 1500);
    }
  }, [isTransactionSuccess, transactionHash, step2Status, onClose, onComplete]);

  // Handle transaction error
  useEffect(() => {
    if (transactionError && step2Status === "loading") {
      setStep2Status("error");
      console.error("Transaction error:", transactionError);
    }
  }, [transactionError, step2Status]);

  const handleStep1 = useCallback(async (): Promise<void> => {
    if (!address || !isConnected) {
      console.warn("Wallet not connected");
      return;
    }

    if (!messageData) {
      console.warn("No message data provided");
      return;
    }

    try {
      setStep1Status("loading");
      resetSignature?.(); // Reset any previous signature state

      // Sign the message using wagmi hook
      console.log("Trying to sign");
      signMessage({
        message: messageData.message,
        account: address,
      });
    } catch (err: unknown) {
      console.error("Failed to initiate signature:", err);
      setStep1Status("error");
    }
  }, [address, isConnected, messageData, signMessage, resetSignature]);

  const handleStep2 = useCallback(async (): Promise<void> => {
    console.log("Starting step 2:", {
      signedData,
      verifyCreateStrategyNonceApi: verifyCreateStrategyNonceApi.data,
      address,
    });

    if (
      !signedData ||
      !verifyCreateStrategyNonceApi.data ||
      !address ||
      !isConnected
    ) {
      console.warn("Missing required data for transaction signing");
      return;
    }

    try {
      setStep2Status("loading");
      resetTransaction?.(); // Reset any previous transaction state

      // Prepare transaction data
      const transactionData = {
        to: verifyCreateStrategyNonceApi.data.to as `0x${string}`,
        data: verifyCreateStrategyNonceApi.data.data as `0x${string}`,
        value: BigInt(verifyCreateStrategyNonceApi.data.value),
        gas: BigInt(verifyCreateStrategyNonceApi.data.gasLimit),
        gasPrice: BigInt(verifyCreateStrategyNonceApi.data.gasPrice),
      };

      console.log(
        "Sending transaction with useSendTransaction:",
        transactionData
      );

      // Send transaction using wagmi hook
      sendTransaction(transactionData);
    } catch (err: any) {
      console.error("Transaction failed:", err);
      setStep2Status("error");
    }
  }, [
    signedData,
    address,
    isConnected,
    verifyCreateStrategyNonceApi.data,
    sendTransaction,
    resetTransaction,
  ]);

  const resetModal = useCallback((): void => {
    setCurrentStep(1);
    setStep1Status("pending");
    setStep2Status("pending");
    resetSignature?.();
    resetTransaction?.();
  }, [resetSignature, resetTransaction]);

  const handleClose = useCallback((): void => {
    onClose();
    resetModal();
  }, [onClose, resetModal]);

  const getStepIcon = useCallback(
    ({ step, status }: StepIconProps): JSX.Element => {
      if (status === "loading") {
        return <Loader2 className="w-4 h-4 animate-spin" />;
      }
      if (status === "completed") {
        return <Check className="w-4 h-4" />;
      }
      if (status === "error") {
        return <X className="w-4 h-4" />;
      }

      return step === 1 ? (
        <FileText className="w-4 h-4" />
      ) : (
        <Send className="w-4 h-4" />
      );
    },
    []
  );

  const getStepColor = useCallback(
    ({ step, status, currentStep }: StepColorProps): string => {
      if (status === "completed") return "bg-green-500";
      if (status === "error") return "bg-red-500";
      if (status === "loading")
        return "bg-gradient-to-r from-pink-500 to-red-500";
      if (currentStep === step)
        return "bg-gradient-to-r from-pink-500 to-red-500";
      return "bg-zinc-600";
    },
    []
  );

  const getConnectorColor = useCallback((): string => {
    if (step1Status === "completed") return "bg-green-500";
    if (step1Status === "error") return "bg-red-500";
    return "bg-zinc-600";
  }, [step1Status]);

  const getErrorMessage = useCallback((error: unknown): string => {
    if (error && typeof error === "object" && "message" in error) {
      return (error as { message: string }).message;
    }
    return "An unknown error occurred";
  }, []);

  // Status message components
  const Step1StatusMessage = (): JSX.Element | null => {
    switch (step1Status) {
      case "loading":
        return (
          <div className="text-pink-400 text-xs">Waiting for signature...</div>
        );
      case "completed":
        return (
          <div className="text-green-400 text-xs">✓ Signed successfully</div>
        );
      case "error":
        return (
          <div className="text-red-400 text-xs">✗ {getErrorMessage(error)}</div>
        );
      default:
        return null;
    }
  };

  const Step2StatusMessage = (): JSX.Element | null => {
    switch (step2Status) {
      case "loading":
        return (
          <div className="text-pink-400 text-xs">Processing transaction...</div>
        );
      case "completed":
        return (
          <div className="text-green-400 text-xs">✓ Strategy created!</div>
        );
      case "error":
        return (
          <div className="text-red-400 text-xs">
            ✗ {getErrorMessage(transactionError)}
          </div>
        );
      default:
        if (currentStep < 2 && step1Status !== "completed") {
          return (
            <div className="text-zinc-500 text-xs">Complete step 1 first</div>
          );
        }
        return null;
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-800/80 rounded-lg p-6 max-w-sm w-full mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close modal"
          type="button"
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
          {/* Step 1 - Sign Message */}
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStepColor(
                  {
                    step: 1,
                    status: step1Status,
                    currentStep,
                  }
                )}`}
              >
                {getStepIcon({ step: 1, status: step1Status })}
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

              {/* Step 1 Button */}
              {currentStep === 1 && step1Status === "pending" && (
                <button
                  onClick={handleStep1}
                  disabled={!isConnected || !address || !messageData}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Sign Message
                </button>
              )}

              {/* Retry button for step 1 */}
              {step1Status === "error" && (
                <button
                  onClick={handleStep1}
                  disabled={!isConnected || !address || !messageData}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Retry Signature
                </button>
              )}

              <Step1StatusMessage />

              {/* Connection warning */}
              {!isConnected &&
                currentStep === 1 &&
                step1Status === "pending" && (
                  <div className="text-yellow-400 text-xs mt-1">
                    Please connect your wallet first
                  </div>
                )}

              {/* Message data warning */}
              {!messageData &&
                currentStep === 1 &&
                step1Status === "pending" && (
                  <div className="text-yellow-400 text-xs mt-1">
                    No message data available
                  </div>
                )}
            </div>
          </div>

          {/* Step 2 - Send Transaction */}
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getStepColor(
                  {
                    step: 2,
                    status: step2Status,
                    currentStep,
                  }
                )}`}
              >
                {getStepIcon({ step: 2, status: step2Status })}
              </div>
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-sm font-medium text-white mb-1">
                Send Transaction
              </h3>
              <p className="text-zinc-400 text-xs mb-3">
                Create strategy on-chain
              </p>

              {/* Step 2 Button */}
              {currentStep === 2 && step2Status === "pending" && (
                <button
                  onClick={handleStep2}
                  disabled={!signedData || !verifyCreateStrategyNonceApi.data}
                  className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Send Transaction
                </button>
              )}

              {/* Retry button for step 2 */}
              {step2Status === "error" && (
                <button
                  onClick={handleStep2}
                  disabled={!signedData || !verifyCreateStrategyNonceApi.data}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Retry Transaction
                </button>
              )}

              <Step2StatusMessage />

              {/* API data warning */}
              {!verifyCreateStrategyNonceApi.data && currentStep === 2 && (
                <div className="text-yellow-400 text-xs mt-1">
                  Waiting for transaction data from API...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Success message */}
        {step2Status === "completed" && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
            <p className="text-green-400 text-xs text-center">
              Strategy created successfully!
            </p>
            {transactionHash && (
              <p className="text-green-300 text-xs text-center mt-1 font-mono">
                Tx: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </p>
            )}
          </div>
        )}

        {/* Error states */}
        {(step1Status === "error" || step2Status === "error") && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
            <p className="text-red-400 text-xs text-center">
              {step1Status === "error"
                ? "Failed to sign message. Please try again."
                : "Failed to send transaction. Please try again."}
            </p>
          </div>
        )}

        {/* Debug info in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-gray-900/20 border border-gray-500/30 rounded">
            <p className="text-gray-400 text-xs">
              <strong>Debug:</strong>
              <br />
              wagmi connected: {isConnected ? "✅" : "❌"}
              <br />
              Address: {address || "None"}
              <br />
              API data: {verifyCreateStrategyNonceApi.data ? "✅" : "❌"}
              <br />
              Signed data: {signedData ? "✅" : "❌"}
              <br />
              Transaction hash: {transactionHash || "None"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyModal;
