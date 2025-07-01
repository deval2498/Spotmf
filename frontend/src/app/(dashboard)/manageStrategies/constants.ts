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

export const MOCK_STRATEGIES = [
  {
    id: 1,
    name: "Growth Portfolio",
    type: "Long-term Investment",
    status: "Active",
    performance: "+12.4%",
    allocation: "70% Stocks, 20% Bonds, 10% Cash",
    createdDate: "2024-01-15",
    lastModified: "2024-06-20",
  },
  {
    id: 2,
    name: "Conservative Income",
    type: "Income Generation",
    status: "Active",
    performance: "+6.8%",
    allocation: "40% Bonds, 30% Dividend Stocks, 30% REITs",
    createdDate: "2024-02-10",
    lastModified: "2024-06-18",
  },
  {
    id: 3,
    name: "Tech Momentum",
    type: "Sector Focus",
    status: "Paused",
    performance: "-2.1%",
    allocation: "90% Tech Stocks, 10% Cash",
    createdDate: "2024-03-05",
    lastModified: "2024-06-15",
  },
];