"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  features?: string[];
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  features,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 rounded-2xl border-border/50",
        "dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <CardHeader>
        <div className="w-12 h-12 rounded-xl bg-foreground/5 border border-border/50 flex items-center justify-center mb-4 transition-all group-hover:bg-foreground/8 group-hover:border-border">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        {features && features.length > 0 && (
          <div className="pt-4 space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <svg
                  className="w-5 h-5 text-foreground shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
