"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/Navbar";
import { AnimatedSection } from "./components/AnimatedSection";
import { FeatureCard } from "./components/FeatureCard";
import { FeatureItem } from "./components/FeatureItem";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-32 pb-20 md:pt-40 md:pb-32">
          {/* Subtle Background Gradient */}
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, hsl(0 0% 50% / 0.06) 0%, transparent 50%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl"
              >
                Automate your crypto buys. Smartly.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
              >
                Build long-term positions effortlessly using scheduled SIPs or
                DMA-based smart triggers.
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
              >
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="px-6 py-4 text-base rounded-full shadow-sm hover:shadow-md transition-all"
                  >
                    Launch app
                  </Button>
                </Link>
              </motion.div>

              {/* Strategy Badges Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.45 }}
                className="mt-12"
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 px-8 py-4 rounded-full shadow-sm">
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
                    <span className="px-4 py-1.5 rounded-full bg-foreground/5 text-foreground border border-border/50">
                      SIP Strategy
                    </span>
                    <Separator
                      orientation="vertical"
                      className="h-4 hidden sm:block"
                    />
                    <span className="px-4 py-1.5 rounded-full bg-foreground/5 text-foreground border border-border/50">
                      DMA Strategy
                    </span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="strategies"
          className="px-6 py-24 md:py-32 bg-muted/20 border-y border-border/40"
        >
          <div className="mx-auto max-w-6xl">
            <AnimatedSection>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
                  Two strategies, one simple goal: disciplined investing.
                </h2>
              </div>
            </AnimatedSection>

            {/* Strategy Cards */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <AnimatedSection delay={0.1}>
                <FeatureCard
                  iconColor="text-[#5E6AD2]"
                  icon={
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
                  }
                  title="Simple SIP"
                  description="Set an interval and amount — we handle the rest. Automate your DCA (Dollar Cost Averaging) strategy with on-chain execution you control."
                  features={[
                    "Choose your interval (daily, weekly, monthly)",
                    "Set your purchase amount",
                    "Let the smart contract do the work",
                  ]}
                />
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <FeatureCard
                  iconColor="text-[#22C55E]"
                  icon={
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
                  }
                  title="DMA Strategy"
                  description="When your chosen token dips below its 50/100/200 DMA, our backend automatically executes a buy, respecting your cooldown and limit settings."
                  features={[
                    "Select your moving average threshold",
                    "Configure cooldown periods",
                    "Buy the dip automatically",
                  ]}
                />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Behind the Scenes Section */}
        <section id="tech" className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <AnimatedSection>
              <div className="text-center space-y-6 mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl mx-auto leading-tight">
                  Fully on-chain. Fully transparent.
                </h2>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  Approve tokens once, stay in control. Our contracts execute
                  trades based on your preferences — no custody, no hidden
                  logic.
                </p>
              </div>
            </AnimatedSection>

            {/* Quote */}
            <AnimatedSection delay={0.1}>
              <div className="mt-12 pt-12 border-t border-border/40">
                <blockquote className="text-xl md:text-2xl font-medium text-foreground/90 italic text-center max-w-3xl mx-auto">
                  &ldquo;Think of it as your personalized crypto autopilot.&rdquo;
                </blockquote>
              </div>
            </AnimatedSection>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-12 mt-20">
              <AnimatedSection delay={0.15}>
                <FeatureItem
                  iconColor="text-[#5E6AD2]"
                  icon={
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  }
                  title="Non-custodial"
                  description="Your funds never leave your wallet until the trade executes."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.25}>
                <FeatureItem
                  iconColor="text-[#22C55E]"
                  icon={
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
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  }
                  title="Open source"
                  description="All contracts are verified and auditable on-chain."
                />
              </AnimatedSection>

              <AnimatedSection delay={0.35}>
                <FeatureItem
                  iconColor="text-[#F59E0B]"
                  icon={
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  }
                  title="Gas optimized"
                  description="Efficient execution means lower costs for your strategy."
                />
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 md:py-32 relative overflow-hidden bg-muted/20 border-t border-border/40">
          {/* Subtle Gradient */}
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, hsl(0 0% 50% / 0.08) 0%, transparent 70%)",
              }}
            />
          </div>

          <AnimatedSection>
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Ready to automate your strategy?
              </h2>
              <div>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="px-6 py-4 text-base rounded-full shadow-sm hover:shadow-md transition-all"
                  >
                    Launch app
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-border/40">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo */}
              <div className="text-lg font-bold tracking-tight">SpotMF</div>

              {/* Links */}
              <nav className="flex items-center gap-8">
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Docs
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-border/40">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} SpotMF. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
