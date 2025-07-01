import { Target, TrendingUp, Check } from "lucide-react";
import { CreateStep, StrategyFormState } from "./types";

export const CREATE_STEPS: CreateStep[] = [
  { title: "Setup strategy", icon: Target },
  { title: "Setup timelines and amounts", icon: TrendingUp },
  { title: "Review and Sign", icon: Check },
];

export const ASSET_OPTIONS = [
  {
    value: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
  },
  {
    value: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
  },
  {
    value: "Hype",
    symbol: "HYPE",
    icon: "🚀",
  },
];

export const STRATEGY_OPTIONS = [
  {
    value: "DCA_WITH_DMA",
    label: "200DMA",
    description: "Focus on market dips for more returns",
    icon: "💰",
  },
  {
    value: "DCA",
    label: "Simple",
    description: "Regular SIP plan",
    icon: "📈",
  },
];

export const INTERVAL_OPTIONS = [
  { value: "7", label: "Weekly" },
  { value: "14", label: "Bi-weekly" },
  { value: "30", label: "Monthly" },
];

export const AMOUNT_OPTIONS = ["50", "100", "250", "500"];

export const INITIAL_STRATEGY_FORM: StrategyFormState = {
  asset: "",
  strategyType: "",
  intervalDays: "",
  intervalAmount: "",
  totalAmount: "",
  acceptedSlippage: "1.0",
  action: "CREATE_STRATEGY",
};