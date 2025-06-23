import { useEffect, useState } from "react";
import { useSignMessage, useAccount } from "wagmi";
import { useApi } from "@/hooks/useApi";

export function Card({
  setShowModal,
  message,
}: {
  setShowModal: (show: boolean) => void;
  message: string;
}) {
  const { address, isConnected } = useAccount();
  const [shouldCallApi, setShouldCallApi] = useState(false);
  const [apiBody, setApiBody] = useState<any>(null);

  const {
    signMessage,
    isPending,
    isSuccess,
    error,
    data: signedData,
  } = useSignMessage();

  // Call API after successful signing
  const {
    data: apiData,
    loading: apiLoading,
    error: apiError,
  } = useApi(
    shouldCallApi ? "/auth/verify" : "", // Only call when shouldCallApi is true
    "post",
    apiBody
  );

  // Watch for successful signature
  useEffect(() => {
    if (isSuccess && signedData && address) {
      // Prepare the API body with signature data
      setApiBody({
        signature: signedData,
        walletAddress: address,
      });
      setShouldCallApi(true);
    }
  }, [isSuccess, signedData, address, message]);
  // Handle API response
  useEffect(() => {
    if (apiData && !apiLoading && !apiError) {
      window.localStorage.setItem("jwt", apiData.jwt);
      // Handle successful API response
      setShowModal(false);
    }
  }, [apiData, apiLoading, apiError, setShowModal]);

  const handleSignMessage = (message: string) => {
    if (address && isConnected) {
      // Reset API state before signing
      setShouldCallApi(false);
      setApiBody(null);
      signMessage({ message, account: address });
    }
  };

  const isProcessing = isPending || (isSuccess && apiLoading);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-white max-w-sm w-full mx-4 shadow-xl relative">
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-300 transition-colors duration-200 disabled:opacity-50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Minimal header */}
        <div className="text-center mb-8">
          {/* Privacy shield icon */}
          <div className="flex justify-center mb-4">
            <svg
              className="w-12 h-12 text-[#ff6b6b]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623A11.99 11.99 0 0020.402 6 11.959 11.959 0 0112 2.25h0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-zinc-100 mb-3">
            Verify Wallet Ownership
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Sign a message to prove wallet ownership.
            <span className="block mt-1 text-zinc-500 text-xs">
              No transaction • No gas fees
            </span>
          </p>
        </div>

        {/* Sign button */}
        <div className="flex justify-center">
          <button
            onClick={() => handleSignMessage(message)}
            disabled={isProcessing}
            className="w-full px-4 py-3 border border-[#f6339a]/30 text-[#f6339a] rounded-md font-medium transition-all duration-200 hover:border-[#f6339a] hover:bg-[#f6339a]/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing && (
              <div className="w-4 h-4 border-2 border-[#f6339a]/30 border-t-[#f6339a] rounded-full animate-spin"></div>
            )}
            {isPending
              ? "Signing..."
              : isSuccess && apiLoading
              ? "Verifying..."
              : "Sign Message"}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 border border-red-500/30 rounded-md">
            <p className="text-red-400 text-sm">Error: {error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
