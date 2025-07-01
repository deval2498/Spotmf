"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useStrategyForm } from "./hooks/useStrategyForm";
import StrategyModal from "./components/StrategyModal";

// Import types and constants
import { Strategy, ViewType } from "./types";

// Import views
import { StrategyList } from "./views/StrategyList";
import { CreateStrategy } from "./views/CreateStrategy";
import { EditStrategy } from "./views/EditStrategy";

type TabType = "live" | "pending";

const ManageStrategies = () => {
  const [view, setView] = useState<ViewType>("list");
  const [currentStep, setCurrentStep] = useState(0);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [strategies, setStrategies] = useState<Strategy[] | undefined>();
  const [activeTab, setActiveTab] = useState<TabType>("live");

  // Use custom hook for form management
  const {
    formData: newStrategy,
    setFormData: setNewStrategy,
    formErrors,
    validateForm,
    resetForm,
  } = useStrategyForm();

  const {
    execute: getStrategies,
    loading: loadingGetStrategies,
    data: getStrategiesData,
    error: getStrategiesError,
  } = useApi();

  const createStrategyApi = useApi();

  // Filter strategies based on active tab
  const filteredStrategies = strategies?.filter((strategy) => {
    if (activeTab === "live") {
      // Live strategies: USDT approved and contract confirmed
      return strategy.isActive && strategy.status === "ACTIVE";
    } else {
      // Pending strategies: awaiting approval or verification
      return strategy.status === "PENDING" || !strategy.isActive;
    }
  });

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const fetchStrategies = async () => {
    await getStrategies({
      url: "/strategy/",
      method: "get",
    });
  };

  const handleRetry = () => {
    fetchStrategies();
  };

  const handleCreate = () => {
    setView("create");
    setCurrentStep(0);
    resetForm();
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setView("edit");
  };

  const handleDelete = (id: number) => {
    setStrategies(strategies?.filter((s) => s.id !== id));
  };

  const handleCreateStrategy = async () => {
    try {
      if (!validateForm()) throw new Error("Invalid strategy form");
      await createStrategyApi.execute({
        url: "auth/create-action",
        method: "post",
        data: newStrategy,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error creating strategy:", error);
    }
  };

  const handleStrategyComplete = () => {
    console.log("Strategy created successfully!");
    setView("list");
    setIsModalOpen(false);
    resetForm();
    // Refresh strategies list
    getStrategies({ url: "/strategy/", method: "get" });
  };

  const handleBackToList = () => {
    setView("list");
    resetForm();
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    if (getStrategiesData?.data) {
      setStrategies(getStrategiesData.data);
    }
  }, [getStrategiesData]);

  if (view === "create") {
    return (
      <>
        <CreateStrategy
          currentStep={currentStep}
          newStrategy={newStrategy}
          formErrors={formErrors}
          loading={createStrategyApi.loading}
          onStepChange={setCurrentStep}
          onStrategyChange={setNewStrategy}
          onBack={handleBackToList}
          onNext={handleNext}
          onPrev={handlePrev}
          onCreateStrategy={handleCreateStrategy}
        />
        <StrategyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={handleStrategyComplete}
          messageData={createStrategyApi.data}
        />
      </>
    );
  }

  if (view === "edit") {
    return (
      <EditStrategy
        strategy={editingStrategy}
        onBack={handleBackToList}
        onSave={(updatedStrategy) => {
          // Handle save logic here
          console.log("Saving strategy:", updatedStrategy);
          handleBackToList();
        }}
      />
    );
  }

  return (
    <StrategyList
      strategies={filteredStrategies}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onCreateClick={handleCreate}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={loadingGetStrategies}
      error={getStrategiesError}
      onRetry={handleRetry}
    />
  );
};

export default ManageStrategies;
