"use client";
import React, { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  BarChart3,
  Clock,
} from "lucide-react";
import StrategyModal from "./components/StrategyModal";
import {
  strategyFormSchema,
  type StrategyFormData,
} from "@/lib/validations/strategy";

// Strategy form state type
interface StrategyFormState {
  type: string;
  asset: string;
  strategyType: string;
  intervalDays: string;
  intervalAmount: string;
  totalAmount: string;
  acceptedSlippage: string;
}

interface FormErrors {
  [key: string]: string;
}

const ManageStrategies = () => {
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [currentStep, setCurrentStep] = useState(0);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [strategies, setStrategies] = useState([
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
  ]);

  const [newStrategy, setNewStrategy] = useState<StrategyFormState>({
    type: "",
    asset: "",
    strategyType: "",
    intervalDays: "",
    intervalAmount: "",
    totalAmount: "",
    acceptedSlippage: "1.0",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const createSteps = [
    { title: "Setup strategy", icon: Target },
    { title: "Setup timelines and amounts", icon: TrendingUp },
    { title: "Review and Sign", icon: Check },
  ];

  const validateForm = (): boolean => {
    try {
      strategyFormSchema.parse(newStrategy);
      setFormErrors({});
      return true;
    } catch (error: any) {
      const errors: FormErrors = {};
      error.errors?.forEach((err: any) => {
        if (err.path) {
          errors[err.path[0]] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
  };

  const handleNext = () => {
    if (currentStep < createSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleCreateStrategy = () => {
    setIsModalOpen(true);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = () => {
    setView("create");
    setCurrentStep(0);
  };

  const handleEdit = (strategy) => {
    setEditingStrategy(strategy);
    setView("edit");
  };

  const handleDelete = (id) => {
    setStrategies(strategies.filter((s) => s.id !== id));
  };

  const handleStrategyComplete = () => {
    // Handle what happens after strategy is created
    console.log("Strategy created successfully!");
    // You might want to redirect to strategy list or show success message
  };

  const renderCreateStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-zinc-100">
              Strategy Basics
            </h3>
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-300">
                  Select Asset Type
                </label>
                {formErrors.asset && (
                  <p className="text-sm text-red-400">{formErrors.asset}</p>
                )}

                <div className="flex gap-2">
                  {[
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
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm
                        ${
                          newStrategy.asset === option.value
                            ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-zinc-100"
                            : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="asset"
                        value={option.value}
                        checked={newStrategy.asset === option.value}
                        onChange={(e) =>
                          setNewStrategy({
                            ...newStrategy,
                            asset: e.target.value,
                          })
                        }
                        className="sr-only"
                      />
                      <span className="text-xs">{option.icon}</span>
                      <span className="font-medium">{option.symbol}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-zinc-300">
                    Select Strategy Type
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
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
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`
                              relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
                              ${
                                newStrategy.type === option.value
                                  ? "border-[#ff6b6b] bg-gradient-to-br from-[#ff6b6b]/10 to-[#ff6b6b]/5 shadow-lg shadow-[#ff6b6b]/20"
                                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800/70"
                              }
                          `}
                      >
                        <input
                          type="radio"
                          name="strategyType"
                          value={option.value}
                          checked={newStrategy.type === option.value}
                          onChange={(e) =>
                            setNewStrategy({
                              ...newStrategy,
                              type: e.target.value,
                            })
                          }
                          className="sr-only"
                        />

                        {/* Selection indicator */}
                        <div
                          className={`
                            absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${
                              newStrategy.type === option.value
                                ? "border-[#ff6b6b] bg-[#ff6b6b]"
                                : "border-zinc-600"
                            }
                          `}
                        >
                          {newStrategy.type === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>

                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-semibold text-zinc-100 mb-1">
                          {option.label}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {option.description}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-zinc-100">
              Investment Schedule
            </h3>

            <div className="space-y-4">
              {/* Interval Days */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Investment interval
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "7", label: "Weekly" },
                    { value: "14", label: "Bi-weekly" },
                    { value: "30", label: "Monthly" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setNewStrategy({
                          ...newStrategy,
                          intervalDays: option.value,
                        })
                      }
                      className={`px-3 py-2 rounded-lg border transition-all text-sm flex-1 ${
                        newStrategy.intervalDays === option.value
                          ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-[#ff6b6b]"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Days"
                      value={newStrategy.intervalDays || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        setNewStrategy({
                          ...newStrategy,
                          intervalDays: value,
                        });
                      }}
                      className="w-16 px-2 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm text-center focus:outline-none focus:border-[#ff6b6b] transition-colors placeholder-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Amount per Interval */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Amount per interval
                </label>
                <div className="flex gap-2 mb-2">
                  {["50", "100", "250", "500"].map((amount) => (
                    <button
                      key={amount}
                      onClick={() =>
                        setNewStrategy({
                          ...newStrategy,
                          intervalAmount: amount,
                        })
                      }
                      className={`px-3 py-2 rounded-lg border transition-all text-sm flex-1 ${
                        newStrategy.intervalAmount === amount
                          ? "border-[#ff6b6b] bg-[#ff6b6b]/10 text-[#ff6b6b]"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="relative w-32">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={newStrategy.intervalAmount || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      setNewStrategy({
                        ...newStrategy,
                        intervalAmount: value,
                      });
                    }}
                    className="w-full pl-6 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-[#ff6b6b] transition-colors placeholder-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Total Budget */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Total budget
                  <span className="text-zinc-500 font-normal text-xs"> </span>
                </label>
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={newStrategy.totalAmount || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      setNewStrategy({
                        ...newStrategy,
                        totalAmount: value,
                      });
                    }}
                    className="w-full pl-6 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-[#ff6b6b] transition-colors placeholder-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Amount for which you will sign the transaction
                </p>
              </div>

              {/* Summary */}
              {newStrategy.intervalAmount && newStrategy.intervalDays && (
                <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                  <p className="text-sm text-zinc-300">
                    <span className="font-medium">Summary:</span> Investing $
                    {newStrategy.intervalAmount} every{" "}
                    {newStrategy.intervalDays} day
                    {newStrategy.intervalDays !== "1" ? "s" : ""}
                    {newStrategy.totalAmount && (
                      <>
                        {" "}
                        for{" "}
                        {Math.floor(
                          Number(newStrategy.totalAmount) /
                            Number(newStrategy.intervalAmount)
                        )}{" "}
                        intervals
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-zinc-100">
              Review and Sign
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400">Asset Type:</span>{" "}
                  <span className="text-zinc-100">{newStrategy.asset}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Strategy Type:</span>{" "}
                  <span className="text-zinc-100">{newStrategy.type}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Interval Days:</span>{" "}
                  <span className="text-zinc-100">
                    {newStrategy.intervalDays}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400">Amount:</span>
                  {newStrategy.intervalAmount}
                </div>
              </div>
              <div>
                <span className="text-zinc-400 text-sm">
                  Total Amount: {newStrategy.totalAmount}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (view === "create") {
    return (
      <div className="h-full text-white">
        {/* Header */}
        <div className="border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-100">
                Create New Strategy
              </h1>
              <p className="text-zinc-400 mt-1">
                Step {currentStep + 1} of {createSteps.length}
              </p>
            </div>
            <button
              onClick={() => setView("list")}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-4">
            {createSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                      isActive
                        ? "border-[#ff6b6b] bg-[#ff6b6b] text-white"
                        : isCompleted
                        ? "border-[#f6339a] bg-[#f6339a] text-white"
                        : "border-zinc-600 bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      isActive
                        ? "text-[#ff6b6b]"
                        : isCompleted
                        ? "text-[#f6339a]"
                        : "text-zinc-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  {index < createSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-zinc-600 ml-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1">
          <div className="max-w-2xl">{renderCreateStep()}</div>
        </div>

        {/* Navigation */}
        <div className="border-t border-zinc-800 p-6">
          <div className="flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={
                currentStep === createSteps.length - 1
                  ? handleCreateStrategy
                  : handleNext
              }
              className="px-6 py-2 bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {currentStep === createSteps.length - 1
                ? "Create Strategy"
                : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
            {
              <StrategyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onComplete={handleStrategyComplete}
              />
            }
          </div>
        </div>
      </div>
    );
  }

  if (view === "edit") {
    return (
      <div className="h-full text-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-100">
            Edit Strategy
          </h1>
          <button
            onClick={() => setView("list")}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="max-w-4xl">
          <div className="bg-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-medium text-zinc-100 mb-6">
              {editingStrategy?.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Strategy Name
                  </label>
                  <input
                    type="text"
                    defaultValue={editingStrategy?.name}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Status
                  </label>
                  <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors">
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Strategy Type
                  </label>
                  <select className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors">
                    <option value="growth">Growth</option>
                    <option value="income">Income</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Allocation
                  </label>
                  <textarea
                    defaultValue={editingStrategy?.allocation}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors h-24 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Performance
                  </label>
                  <input
                    type="text"
                    defaultValue={editingStrategy?.performance}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-[#ff6b6b] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setView("list")}
                className="px-6 py-2 text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button className="px-6 py-2 bg-[#f6339a] hover:bg-[#f6339a]/90 text-white rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              Manage Strategies
            </h1>
            <p className="text-zinc-400 mt-1">
              Create, edit, and monitor your investment strategies
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Strategy
          </button>
        </div>
      </div>

      {/* Strategy List */}
      <div className="p-6">
        <div className="grid gap-4">
          {strategies.map((strategy) => (
            <div
              key={strategy.id}
              className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50 hover:border-zinc-600/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-zinc-100">
                      {strategy.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        strategy.status === "Active"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {strategy.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-400">Type:</span>
                      <span className="text-sm text-zinc-100">
                        {strategy.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-400">
                        Performance:
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          strategy.performance.startsWith("+")
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {strategy.performance}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-400">Modified:</span>
                      <span className="text-sm text-zinc-100">
                        {strategy.lastModified}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-sm text-zinc-400">Allocation: </span>
                    <span className="text-sm text-zinc-100">
                      {strategy.allocation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(strategy)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors group"
                    title="Edit Strategy"
                  >
                    <Edit3 className="w-4 h-4 text-zinc-400 group-hover:text-[#f6339a]" />
                  </button>
                  <button
                    onClick={() => handleDelete(strategy.id)}
                    className="p-2 hover:bg-zinc-700 rounded-lg transition-colors group"
                    title="Delete Strategy"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-400 group-hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {strategies.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              No strategies yet
            </h3>
            <p className="text-zinc-500 mb-6">
              Create your first investment strategy to get started
            </p>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStrategies;
