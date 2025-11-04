"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { TokenSelector } from "./TokenSelector";

interface SIPStrategyFormProps {
  onSubmit: (data: SIPFormData) => void;
}

export interface SIPFormData {
  tokenSymbol: string;
  investmentAmount: string;
  interval: string;
  customInterval?: string;
  totalInvestment: string;
}

const INTERVAL_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" },
];

export function SIPStrategyForm({ onSubmit }: SIPStrategyFormProps) {
  const [formData, setFormData] = useState<SIPFormData>({
    tokenSymbol: "",
    investmentAmount: "",
    interval: "weekly",
    totalInvestment: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof SIPFormData,
    value: string
  ) => {
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

              {/* Investment Amount */}
              <div className="space-y-2">
                <Label htmlFor="investmentAmount">Amount per Interval</Label>
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
                  Amount to invest each time
                </p>
              </div>

              {/* Interval Selection */}
              <div className="space-y-2">
                <Label htmlFor="interval">Investment Interval</Label>
                <Select
                  id="interval"
                  value={formData.interval}
                  onChange={(e) => handleChange("interval", e.target.value)}
                  required
                >
                  {INTERVAL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                <p className="text-xs text-muted-foreground">
                  Frequency of purchases
                </p>
              </div>

              {/* Custom Interval (if selected) */}
              {formData.interval === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customInterval">Custom Interval (days)</Label>
                  <Input
                    id="customInterval"
                    type="number"
                    placeholder="7"
                    value={formData.customInterval || ""}
                    onChange={(e) =>
                      handleChange("customInterval", e.target.value)
                    }
                    min="1"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Days between investments
                  </p>
                </div>
              )}

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
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Investment</p>
            <p className="font-medium">
              {formData.investmentAmount || "—"} USDC
              {formData.tokenSymbol && ` → ${formData.tokenSymbol}`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Frequency</p>
            <p className="font-medium">
              {formData.interval === "custom"
                ? formData.customInterval
                  ? `Every ${formData.customInterval} days`
                  : "Custom"
                : INTERVAL_OPTIONS.find((o) => o.value === formData.interval)?.label || "—"}
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
          Create SIP Strategy
        </Button>
      </div>
    </form>
  );
}
