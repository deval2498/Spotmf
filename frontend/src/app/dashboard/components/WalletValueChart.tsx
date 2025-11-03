"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
}

type TimeResolution = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y";

// Mock data for different resolutions
const mockDataSets: Record<TimeResolution, DataPoint[]> = {
  "1D": [
    { date: "00:00", value: 3350 },
    { date: "04:00", value: 3380 },
    { date: "08:00", value: 3360 },
    { date: "12:00", value: 3400 },
    { date: "16:00", value: 3420 },
    { date: "20:00", value: 3420 },
  ],
  "1W": [
    { date: "Mon", value: 3280 },
    { date: "Tue", value: 3320 },
    { date: "Wed", value: 3290 },
    { date: "Thu", value: 3360 },
    { date: "Fri", value: 3400 },
    { date: "Sat", value: 3420 },
  ],
  "1M": [
    { date: "Wk1", value: 3050 },
    { date: "Wk2", value: 3180 },
    { date: "Wk3", value: 3240 },
    { date: "Wk4", value: 3420 },
  ],
  "3M": [
    { date: "Apr", value: 2400 },
    { date: "May", value: 2950 },
    { date: "Jun", value: 3420 },
  ],
  "6M": [
    { date: "Jan", value: 1200 },
    { date: "Feb", value: 1850 },
    { date: "Mar", value: 1650 },
    { date: "Apr", value: 2400 },
    { date: "May", value: 2950 },
    { date: "Jun", value: 3420 },
  ],
  "1Y": [
    { date: "Q1", value: 800 },
    { date: "Q2", value: 1200 },
    { date: "Q3", value: 2100 },
    { date: "Q4", value: 3420 },
  ],
};

const resolutions: TimeResolution[] = ["1D", "1W", "1M", "3M", "6M", "1Y"];

export function WalletValueChart() {
  const [selectedResolution, setSelectedResolution] =
    useState<TimeResolution>("6M");

  const mockData = mockDataSets[selectedResolution];
  const currentValue = mockData[mockData.length - 1].value;
  const previousValue = mockData[0].value;
  const percentageChange = ((currentValue - previousValue) / previousValue) * 100;

  const { points, minValue, maxValue } = useMemo(() => {
    const values = mockData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = 100;
    const height = 100;
    const paddingX = 2; // Minimal horizontal padding
    const paddingY = 8; // Vertical padding for breathing room

    const points = mockData
      .map((d, i) => {
        const x = (i / (mockData.length - 1)) * (width - 2 * paddingX) + paddingX;
        const y = height - paddingY - ((d.value - min) / (max - min)) * (height - 2 * paddingY);
        return `${x},${y}`;
      })
      .join(" ");

    return { points, minValue: min, maxValue: max };
  }, [mockData]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Wallet Value
            </p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-bold tracking-tight">
                ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">USD</span>
                <span className={`text-sm font-medium ${percentageChange >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                  {percentageChange >= 0 ? "+" : ""}{percentageChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Resolution Buttons */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            {resolutions.map((resolution) => (
              <Button
                key={resolution}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResolution(resolution)}
                className={cn(
                  "h-7 px-2.5 text-xs font-medium rounded-md transition-colors",
                  selectedResolution === resolution
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {resolution}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="relative w-full pb-5" style={{ height: "220px" }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grid lines - horizontal */}
            <line
              x1="2"
              y1="92"
              x2="98"
              y2="92"
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-border/60"
            />
            <line
              x1="2"
              y1="50"
              x2="98"
              y2="50"
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-border/40"
            />
            <line
              x1="2"
              y1="8"
              x2="98"
              y2="8"
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-border/40"
            />

            {/* Area under the line - gradient effect */}
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" className="text-foreground" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-foreground" />
              </linearGradient>
            </defs>
            <polygon
              points={`2,92 ${points} 98,92`}
              fill="url(#chartGradient)"
            />

            {/* Line - thicker and smoother */}
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* X-axis labels - Google Finance style (first, middle, last) */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
            <span className="text-xs text-muted-foreground font-normal">
              {mockData[0].date}
            </span>
            {mockData.length > 2 && (
              <span className="text-xs text-muted-foreground font-normal">
                {mockData[Math.floor(mockData.length / 2)].date}
              </span>
            )}
            <span className="text-xs text-muted-foreground font-normal">
              {mockData[mockData.length - 1].date}
            </span>
          </div>
        </div>

        {/* Period Summary */}
        <div className="pt-4 border-t border-border/40">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-normal">Low</p>
              <p className="text-sm font-semibold">
                ${minValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-normal">High</p>
              <p className="text-sm font-semibold">
                ${maxValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-normal">Change</p>
              <p className={`text-sm font-semibold ${percentageChange >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                {percentageChange >= 0 ? "+" : ""}${(currentValue - previousValue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
