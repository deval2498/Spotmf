"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { RiArrowDropDownLine } from "react-icons/ri";

const ChartComponent = () => {
  const [selectedResolution, setSelectedResolution] = useState("1D");
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);

  // Available symbols with realistic data
  const symbols = [
    {
      key: "BTC",
      label: "Bitcoin",
      color: "#f59e0b",
      icon: "₿",
      basePrice: 65000,
    },
    {
      key: "ETH",
      label: "Ethereum",
      color: "#6366f1",
      icon: "Ξ",
      basePrice: 3200,
    },
    {
      key: "UBTC",
      label: "UBTC",
      color: "#10b981",
      icon: "U",
      basePrice: 64500,
    },
    {
      key: "USDT",
      label: "Tether",
      color: "#22c55e",
      icon: "$",
      basePrice: 1.0,
    },
    {
      key: "SOL",
      label: "Solana",
      color: "#8b5cf6",
      icon: "S",
      basePrice: 140,
    },
    {
      key: "ADA",
      label: "Cardano",
      color: "#3b82f6",
      icon: "A",
      basePrice: 0.45,
    },
  ];

  // Time resolution options
  const resolutions = [
    { key: "1D", label: "1D" },
    { key: "5D", label: "5D" },
    { key: "1M", label: "1M" },
    { key: "6M", label: "6M" },
    { key: "1Y", label: "1Y" },
    { key: "ALL", label: "ALL" },
  ];

  const currentSymbol = symbols.find((symbol) => symbol.key === selectedSymbol);

  // Generate realistic price data
  const generatePriceData = (resolution, symbol) => {
    const dataPoints = {
      "1D": 24,
      "5D": 120,
      "1M": 30,
      "6M": 180,
      "1Y": 365,
      ALL: 730,
    };

    const points = dataPoints[resolution];
    const symbolData = symbols.find((s) => s.key === symbol);
    const basePrice = symbolData?.basePrice || 45000;
    const data = [];

    for (let i = 0; i < points; i++) {
      const date = new Date();

      // Adjust date based on resolution
      if (resolution === "1D") {
        date.setHours(date.getHours() - (points - i));
      } else {
        date.setDate(date.getDate() - (points - i));
      }

      // Generate realistic price movements
      const volatility = (Math.random() - 0.5) * 0.04; // ±2% volatility
      const trend = Math.sin((i / points) * Math.PI * 4) * 0.05; // Sine wave trend
      const noise = (Math.random() - 0.5) * 0.01; // Small random noise

      const priceMultiplier = 1 + trend + volatility + noise;
      const price = basePrice * priceMultiplier;

      data.push({
        time: date.getTime(),
        price: Math.round(price * 100) / 100,
        formattedTime: formatTimeLabel(date, resolution),
        fullDate: date.toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    return data;
  };

  // Format time labels based on resolution
  const formatTimeLabel = (date, resolution) => {
    switch (resolution) {
      case "1D":
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      case "5D":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
        });
      default:
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
    }
  };

  const data = useMemo(
    () => generatePriceData(selectedResolution, selectedSymbol),
    [selectedResolution, selectedSymbol]
  );

  // Calculate price statistics
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const percentChange =
    firstPrice > 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : "0.00";
  const isPositive = priceChange >= 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentSymbol.color }}
            />
            <span className="text-slate-300 text-sm font-medium">
              {currentSymbol.label}
            </span>
          </div>
          <p className="text-slate-400 text-xs mb-1">{data.fullDate}</p>
          <p className="text-white font-bold text-lg">
            ${payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSymbolDropdownOpen && !event.target.closest(".symbol-dropdown")) {
        setIsSymbolDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isSymbolDropdownOpen]);

  return (
    <div className="bg-gradient-to-br from-slate-600/20 via-slate-500/20 to-slate-700/20 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-xl">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: currentSymbol.color }}
            >
              {currentSymbol.icon}
            </div>
            <h2 className="text-slate-200 font-bold text-xl">
              {currentSymbol.label}
            </h2>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-white font-bold text-2xl">${lastPrice}</span>
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {isPositive ? "+" : ""}${Math.abs(priceChange).toFixed(2)}
              </span>
              <span
                className={`text-sm px-2 py-1 rounded-md ${
                  isPositive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-red-400 bg-red-500/10"
                }`}
              >
                {isPositive ? "+" : ""}
                {percentChange}%
              </span>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex items-center gap-3">
          {/* Symbol Dropdown */}
          <div className="relative symbol-dropdown">
            <button
              onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
              className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-600/40 border border-slate-600/50 px-3 py-2 rounded-xl transition-all duration-200 group"
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: currentSymbol.color }}
              >
                {currentSymbol.icon}
              </div>
              <span className="text-slate-200 text-sm font-medium">
                {selectedSymbol}
              </span>
              <RiArrowDropDownLine
                className={`text-slate-400 group-hover:text-slate-300 transition-all duration-200 ${
                  isSymbolDropdownOpen ? "rotate-180" : ""
                }`}
                size={18}
              />
            </button>

            {/* Dropdown Menu */}
            {isSymbolDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-xl z-20 min-w-[180px] max-h-64 overflow-y-auto">
                {symbols.map((symbol) => (
                  <button
                    key={symbol.key}
                    onClick={() => {
                      setSelectedSymbol(symbol.key);
                      setIsSymbolDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      selectedSymbol === symbol.key ? "bg-slate-700/30" : ""
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: symbol.color }}
                    >
                      {symbol.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-slate-200 text-sm font-medium">
                        {symbol.label}
                      </div>
                      <div className="text-slate-400 text-xs">{symbol.key}</div>
                    </div>
                    <div className="text-slate-300 text-sm">
                      ${symbol.basePrice.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resolution Buttons */}
          <div className="flex bg-slate-700/30 rounded-xl p-1 gap-1">
            {resolutions.map((resolution) => (
              <button
                key={resolution.key}
                onClick={() => setSelectedResolution(resolution.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedResolution === resolution.key
                    ? "bg-slate-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
                }`}
              >
                {resolution.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${selectedSymbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={currentSymbol.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={currentSymbol.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="formattedTime"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              interval="preserveStartEnd"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              domain={["dataMin * 0.998", "dataMax * 1.002"]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="price"
              stroke={currentSymbol.color}
              strokeWidth={2.5}
              fill={`url(#gradient-${selectedSymbol})`}
              dot={false}
              activeDot={{
                r: 5,
                fill: currentSymbol.color,
                stroke: "#1e293b",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Section */}
      {/* <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-xs">
            {selectedResolution} • {currentSymbol.label}
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-slate-500 text-xs">Live</span>
          </div>
        </div>
        <span className="text-slate-500 text-xs">
          Updated {new Date().toLocaleTimeString()}
        </span>
      </div> */}
    </div>
  );
};

export default ChartComponent;
