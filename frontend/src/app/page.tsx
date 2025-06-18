"use client";
import { Navbar } from "@/components/ui/Navbar";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { useState } from "react";
import { Hero, HeroAdvanced } from "@/components/ui/Hero";
// import Wallet from "./components/Wallet";
export default function Home() {
  const [showNavbar, setShowNavbar] = useState(false);

  const handleLogoAnimationComplete = () => {
    // Start navbar animation after logo reaches its position
    setShowNavbar(true);
  };
  return (
    <div className="min-h-screen bg-black">
      {/* Animated Logo - starts immediately */}
      <AnimatedLogo onAnimationComplete={handleLogoAnimationComplete} />

      {/* Navbar - shows after logo animation completes */}
      <Navbar showNavbar={showNavbar} />

      {/* Rest of your content */}
      <Hero showHero={showNavbar} />
    </div>
  );
}
