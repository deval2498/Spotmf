// Linear-inspired design tokens
export const theme = {
  colors: {
    brand: {
      primary: "#5E6AD2", // Linear Indigo
      hover: "#4B57C0",
      foreground: "#FFFFFF",
    },
    neutral: {
      bg: "#F4F5F8",
      surface: "#FFFFFF",
      text: "#222326",
      textMuted: "#6B7280",
      darkBg: "#0F1724",
      darkSurface: "#111827",
      border: "#E6E8EB",
      darkBorder: "#334155",
    },
    accent: {
      info: "#5B8CFF",
      success: "#22C55E",
      warning: "#F59E0B",
      danger: "#EF4444",
    },
  },
  radius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    pill: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(15,23,36,0.04)",
    md: "0 8px 24px rgba(15,23,36,0.06)",
    lg: "0 16px 48px rgba(15,23,36,0.08)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
  },
} as const;

export type Theme = typeof theme;
