"use client";

import { Card } from "@/components/ui/card";
import { useMemo } from "react";

interface Token {
  symbol: string;
  name: string;
  value: number;
  color: string;
}

// Mock token distribution data
const tokens: Token[] = [
  { symbol: "BTC", name: "Bitcoin", value: 1850, color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", value: 1200, color: "#627EEA" },
  { symbol: "HYPE", name: "Hyperliquid", value: 370, color: "#8B5CF6" },
];

export function TokenDistributionChart() {
  const total = useMemo(
    () => tokens.reduce((sum, token) => sum + token.value, 0),
    []
  );

  const chartData = useMemo(() => {
    let currentAngle = -90; // Start from top
    return tokens.map((token) => {
      const percentage = (token.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Calculate path for SVG arc
      const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
      const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
      const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
      const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
      const largeArc = angle > 180 ? 1 : 0;

      return {
        ...token,
        percentage,
        path: `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`,
      };
    });
  }, [total]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Asset Distribution
          </p>
          <p className="text-xs text-muted-foreground">
            Portfolio allocation across tokens
          </p>
        </div>

        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-48 h-48"
          >
            {chartData.map((data, i) => (
              <path
                key={i}
                d={data.path}
                fill={data.color}
                opacity="0.9"
                className="transition-opacity hover:opacity-100"
              />
            ))}
            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="25" fill="currentColor" className="text-card" />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {tokens.map((token) => {
            const percentage = ((token.value / total) * 100).toFixed(1);
            return (
              <div key={token.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: token.color, opacity: 0.9 }}
                  />
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {token.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">
                    ${token.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total Value
            </span>
            <span className="text-base font-bold">
              ${total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
