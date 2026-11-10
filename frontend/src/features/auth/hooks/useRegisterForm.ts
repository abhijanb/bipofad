import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/features/app/apiError";
import { useRegisterMutation } from "../authApi";
import { registerSchema, type RegisterForm } from "../schema";

type ConflictData = {
  suggested_usernames?: string[];
  suggested_email?: string[];
};

export type Suggestion = { field: "username" | "email"; value: string };

export function useRegisterForm() {
  const navigate = useNavigate();
  const [registerUser] = useRegisterMutation();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterForm) {
    setSuggestions([]);

    try {
      const data = await registerUser(values).unwrap();
      toast.success(data.message);
      reset();
      navigate("/login", { replace: true });
    } catch (error) {
      const data = (error as { data?: ConflictData }).data;

      setSuggestions([
        ...(data?.suggested_usernames ?? []).map((value) => ({
          field: "username" as const,
          value,
        })),
        ...(data?.suggested_email ?? []).map((value) => ({
          field: "email" as const,
          value,
        })),
      ]);

      toast.error(getApiErrorMessage(error, "Registration failed"));
    }
  }

  function applySuggestion(suggestion: Suggestion) {
    setValue(suggestion.field, suggestion.value);
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
    suggestions,
    applySuggestion,
  };
}
