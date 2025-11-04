"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TokenSelector } from "./TokenSelector";

interface DMAStrategyFormProps {
  onSubmit: (data: DMAFormData) => void;
}

export interface DMAFormData {
  tokenSymbol: string;
  movingAverage: string;
  investmentAmount: string;
  cooldownPeriod: string;
  totalInvestment: string;
}

const MA_OPTIONS = [
  { value: "50", label: "50 DMA (Short-term)" },
  { value: "100", label: "100 DMA (Medium-term)" },
  { value: "200", label: "200 DMA (Long-term)" },
];

const COOLDOWN_OPTIONS = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
];

export function DMAStrategyForm({ onSubmit }: DMAStrategyFormProps) {
  const [formData, setFormData] = useState<DMAFormData>({
    tokenSymbol: "",
    movingAverage: "50",
    investmentAmount: "",
    cooldownPeriod: "7",
    totalInvestment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof DMAFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      {/* Token Selection */}
      <TokenSelector
        selectedToken={formData.tokenSymbol}
        onSelect={(symbol) => handleChange("tokenSymbol", symbol)}
      />

      {/* Grid Layout for Main Fields */}
      <div className="grid md:grid-cols-2 gap-6">

              {/* Moving Average Selection */}
              <div className="space-y-2">
                <Label htmlFor="movingAverage">Moving Average Period</Label>
                <Select
                  id="movingAverage"
                  value={formData.movingAverage}
                  onChange={(e) =>
                    handleChange("movingAverage", e.target.value)
                  }
                  required
                >
                  {MA_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  Buy when price drops below this MA
                </p>
              </div>

              {/* Investment Amount */}
              <div className="space-y-2">
                <Label htmlFor="investmentAmount">
                  Amount per Trigger
                </Label>
                <div className="relative">
                  <Input
                    id="investmentAmount"
                    type="number"
                    placeholder="100"
                    value={formData.investmentAmount}
                    onChange={(e) =>
                      handleChange("investmentAmount", e.target.value)
                    }
                    step="0.01"
                    min="0"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    USDC
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Investment when triggered
                </p>
              </div>

              {/* Cooldown Period */}
              <div className="space-y-2">
                <Label htmlFor="cooldownPeriod">Cooldown Period</Label>
                <Select
                  id="cooldownPeriod"
                  value={formData.cooldownPeriod}
                  onChange={(e) =>
                    handleChange("cooldownPeriod", e.target.value)
                  }
                  required
                >
                  {COOLDOWN_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  Time between consecutive buys
                </p>
              </div>

              {/* Total Investment Budget */}
              <div className="space-y-2">
                <Label htmlFor="totalInvestment">Total Budget</Label>
                <div className="relative">
                  <Input
                    id="totalInvestment"
                    type="number"
                    placeholder="1000"
                    value={formData.totalInvestment}
                    onChange={(e) =>
                      handleChange("totalInvestment", e.target.value)
                    }
                    step="0.01"
                    min="0"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    USDC
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum total investment
                </p>
              </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">How DMA Strategy Works</p>
            <p className="text-blue-700 dark:text-blue-300">
              The strategy monitors the token price and automatically
              executes a buy when the price drops below the selected
              moving average, ensuring data-driven entries at statistical
              dips.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="rounded-lg bg-muted/50 border border-border p-5 space-y-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h4 className="text-sm font-semibold">Strategy Summary</h4>
        </div>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Investment</p>
            <p className="font-medium">
              {formData.investmentAmount || "—"} USDC
              {formData.tokenSymbol && ` → ${formData.tokenSymbol}`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Trigger</p>
            <p className="font-medium">
              {formData.movingAverage
                ? `Below ${formData.movingAverage} DMA`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Cooldown</p>
            <p className="font-medium">
              {COOLDOWN_OPTIONS.find(
                (o) => o.value === formData.cooldownPeriod
              )?.label || "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Total Budget</p>
            <p className="font-medium">
              {formData.totalInvestment || "—"} USDC
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" className="min-w-[200px]">
          Create DMA Strategy
        </Button>
      </div>
    </form>
  );
}
