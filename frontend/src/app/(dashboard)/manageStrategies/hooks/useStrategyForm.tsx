import { useState } from "react";
import { StrategyFormState, FormErrors } from "../types";
import { INITIAL_STRATEGY_FORM } from "../constants";
import { strategyFormSchema } from "@/lib/validations/strategy";

export const useStrategyForm = () => {
  const [formData, setFormData] = useState<StrategyFormState>(
    INITIAL_STRATEGY_FORM
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    try {
      strategyFormSchema.parse(formData);
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

  const resetForm = () => {
    setFormData(INITIAL_STRATEGY_FORM);
    setFormErrors({});
  };

  return {
    formData,
    setFormData,
    formErrors,
    validateForm,
    resetForm,
  };
};
