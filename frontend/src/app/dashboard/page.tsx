"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your crypto investment automation hub
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Portfolio Value
            </p>
            <h3 className="text-2xl font-bold">$0.00</h3>
            <p className="text-xs text-muted-foreground">
              Connect wallet to see balance
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active SIP Strategies
            </p>
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-xs text-muted-foreground">
              No strategies configured
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Active DMA Strategies
            </p>
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-xs text-muted-foreground">
              No strategies configured
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Total Invested
            </p>
            <h3 className="text-2xl font-bold">$0.00</h3>
            <p className="text-xs text-muted-foreground">
              Lifetime investment amount
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-[#5E6AD2]/10 p-3 text-[#5E6AD2]">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">Create SIP Strategy</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up automated dollar-cost averaging for your chosen token
                  </p>
                </div>
              </div>
              <Button className="w-full">Get Started</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-[#22C55E]/10 p-3 text-[#22C55E]">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">Create DMA Strategy</h3>
                  <p className="text-sm text-muted-foreground">
                    Buy the dip automatically when price falls below moving average
                  </p>
                </div>
              </div>
              <Button className="w-full">Get Started</Button>
            </div>
          </Card>
        </div>
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
