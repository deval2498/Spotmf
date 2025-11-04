"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SIPStrategyForm, SIPFormData } from "./components/SIPStrategyForm";
import { DMAStrategyForm, DMAFormData } from "./components/DMAStrategyForm";

export default function StrategyPage() {
  const handleSIPSubmit = (data: SIPFormData) => {
    console.log("SIP Strategy Data:", data);
    // TODO: Implement contract interaction and backend API call
    // This will:
    // 1. Request token approval from user's wallet
    // 2. Submit strategy configuration to backend
    // 3. Redirect to active strategies page or show success message
  };

  const handleDMASubmit = (data: DMAFormData) => {
    console.log("DMA Strategy Data:", data);
    // TODO: Implement contract interaction and backend API call
    // This will:
    // 1. Request token approval from user's wallet
    // 2. Submit strategy configuration to backend
    // 3. Redirect to active strategies page or show success message
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Investment Strategy
        </h1>
        <p className="text-muted-foreground text-lg">
          Automate your crypto investments with rule-based strategies
        </p>
      </div>

      {/* Strategy Selection and Form */}
      <div className="flex justify-center">
        <Tabs defaultValue="sip" className="w-full max-w-3xl space-y-6">
        {/* Tabs List */}
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto p-1">
          <TabsTrigger value="sip" className="gap-2 py-3">
            <svg
              className="w-4 h-4"
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
            Simple SIP
          </TabsTrigger>
          <TabsTrigger value="dma" className="gap-2 py-3">
            <svg
              className="w-4 h-4"
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
            DMA Strategy
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
        <TabsContent value="sip" className="mt-0">
          <Card className="border-2">
            <div className="p-8">
              <SIPStrategyForm onSubmit={handleSIPSubmit} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="dma" className="mt-0">
          <Card className="border-2">
            <div className="p-8">
              <DMAStrategyForm onSubmit={handleDMASubmit} />
            </div>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
