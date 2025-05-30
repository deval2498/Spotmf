import React from "react";
import type { ButtonProps } from "./button.types";
import { cn } from "@/lib/utils";
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "default",
  disabled = false,
  onClick,
  className = "",
}) => {
  const baseStyles = `inline-flex items-center justify-center rounded-md px-4 py-2 gap-2 font-sans font-medium antialiased`;

  const variantStyles: Record<string, string> = {
    default: `bg-black text-white dark:bg-white dark:text-black`,
    destructive: `bg-red-600 text-white`,
    outline: `border border-black text-black bg-transparent hover:bg-gray-400 dark:border-white dark:text-white`,
    secondary: `text-black bg-gray-200 dark:text-white`,
    destructive_outline: `border border-red-600 text-red-600 bg-transparent hover:bg-red-600/20`,
  };

  const disabledStyles = `bg-gray-500 text-white`;
  return (
    <button
      className={cn(
        baseStyles,
        disabled
          ? disabledStyles
          : [variantStyles[variant], "hover:cursor-pointer hover:opacity-80"],
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
