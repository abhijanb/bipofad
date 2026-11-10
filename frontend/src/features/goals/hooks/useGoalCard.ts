import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/features/app/apiError";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import type { VaultProduct } from "@/features/vault/types";
import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useGoalsQuery,
  useUpdateGoalMutation,
} from "../goalApi";
import { goalGramsSchema, type GoalGramsForm } from "../schema";

/** Data, form state, and actions for one metal's savings-goal card. */
export function useGoalCard(product: VaultProduct) {
  const { data: goals, isLoading, isError, error, refetch } = useGoalsQuery();
  const [createGoal, { isLoading: isCreating }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating }] = useUpdateGoalMutation();
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteGoalMutation();
  const [editing, setEditing] = useState(false);

  const goal = goals?.find((item) => item.product === product);
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);
  const saving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalGramsForm>({
    resolver: zodResolver(goalGramsSchema),
    defaultValues: { target_grams: goal?.target_grams ?? 1 },
  });

  useEffect(() => {
    reset({ target_grams: goal?.target_grams ?? 1 });
  }, [goal, reset]);

  async function onSubmit(values: GoalGramsForm) {
    try {
      const result = goal
        ? await updateGoal({
            id: goal.id,
            target_grams: values.target_grams,
          }).unwrap()
        : await createGoal({
            product,
            target_grams: values.target_grams,
          }).unwrap();
      toast.success(result.message);
      setEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not save your goal"));
    }
  }

  async function onDelete() {
    if (!goal) return;
    if (!window.confirm(`Delete your ${lowerLabel} savings goal?`)) return;
    try {
      const result = await deleteGoal(goal.id).unwrap();
      toast.success(result.message);
      setEditing(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not delete your goal"));
    }
  }

  function startEditing() {
    setEditing(true);
  }

  function cancelEditing() {
    reset({ target_grams: goal?.target_grams ?? 1 });
    setEditing(false);
  }

  return {
    goal,
    label,
    lowerLabel,
    isLoading,
    isError,
    error,
    refetch,
    isDeleting,
    saving,
    editing,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    onDelete,
    startEditing,
    cancelEditing,
  };
}
