"use client";
import { Navbar } from "@/components/ui/Navbar";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { useState } from "react";
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
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto text-white">
          <h1 className="text-4xl font-bold mb-4">Your App Content</h1>
          <p className="text-gray-300">
            Logo animation runs first, then navbar animates in.
          </p>
        </div>
      </div>
    </div>
  );
}
