import { useGoalsQuery } from "../goalApi";

/** Goals plus the aggregate numbers shown at the top of the progress page. */
export function useProgressPage() {
  const { data, isLoading, isError } = useGoalsQuery();
  const goals = data ?? [];

  const showSummary = !isLoading && !isError;
  const goalCount = goals.length;
  const completedCount = goals.filter((goal) => goal.is_complete).length;
  const totalValuePaisa = goals.reduce(
    (sum, goal) => sum + goal.value_paisa,
    0,
  );
  const averageProgress =
    goalCount > 0
      ? Math.round(
          goals.reduce((sum, goal) => sum + goal.progress_percent, 0) /
            goalCount,
        )
      : 0;

  return {
    goals,
    isLoading,
    isError,
    showSummary,
    goalCount,
    completedCount,
    totalValuePaisa,
    averageProgress,
  };
}
