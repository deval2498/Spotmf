"use client";

import { Card } from "@/components/ui/card";
import { WalletValueChart } from "./components/WalletValueChart";
import { TokenDistributionChart } from "./components/TokenDistributionChart";
import { ConnectWalletButton } from "@/components/shared/ConnectWalletButton";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your crypto investment automation hub
          </p>
        </div>
        <ConnectWalletButton />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Portfolio Value
            </p>
            <h3 className="text-2xl font-bold">$3,420.00</h3>
            <p className="text-xs text-emerald-600 font-medium">
              +185.0% all time
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active SIP Strategies
            </p>
            <h3 className="text-2xl font-bold">2</h3>
            <p className="text-xs text-muted-foreground">
              Running on schedule
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active DMA Strategies
            </p>
            <h3 className="text-2xl font-bold">1</h3>
            <p className="text-xs text-muted-foreground">
              Monitoring market
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Invested
            </p>
            <h3 className="text-2xl font-bold">$1,200.00</h3>
            <p className="text-xs text-muted-foreground">
              Lifetime investment amount
            </p>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WalletValueChart />
        <TokenDistributionChart />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Card className="p-6">
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="font-medium mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground">
              Your trading activity will appear here
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
