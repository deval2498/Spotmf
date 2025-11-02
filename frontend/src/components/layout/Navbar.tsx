"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out backdrop-blur-md border-b",
        scrolled
          ? "bg-background/95 shadow-sm border-border/40"
          : "bg-background/60 border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-lg font-bold tracking-tight">SpotMF</div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#strategies"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Strategies
            </a>
            <a
              href="#tech"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Technology
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </a>
          </div>

          {/* CTA Button */}
          <Button size="default" className="transition-all">
            Launch app
          </Button>
        </div>
      </div>
    </nav>
  );
}
