import type { ReactNode } from "react";

export interface ButtonProps {
    children: ReactNode;
    variant?:
      | "destructive"
      | "default"
      | "outline"
      | "secondary"
      | "destructive_outline"
      | "gradient"
      | "gradient-outline";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
  }
