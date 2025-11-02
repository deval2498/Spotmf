import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconColor?: string;
}

export function FeatureItem({
  icon,
  title,
  description,
  iconColor = "text-foreground",
}: FeatureItemProps) {
  return (
    <div className="space-y-3 group">
      <div
        className={cn(
          "w-10 h-10 rounded-xl bg-foreground/5 border border-border/50 flex items-center justify-center transition-all",
          iconColor
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
