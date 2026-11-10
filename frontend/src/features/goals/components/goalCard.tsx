import { formatGrams, formatRupees } from "@/features/vault/format";
import type { VaultProduct } from "@/features/vault/types";
import { getApiErrorMessage } from "@/features/app/apiError";
import { useGoalCard } from "../hooks/useGoalCard";

export function GoalCard({ product }: { product: VaultProduct }) {
  const {
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
    handleSubmit,
    errors,
    onDelete,
    startEditing,
    cancelEditing,
  } = useGoalCard(product);

  const progressClass = goal?.is_complete
    ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
    : product === "GOLD"
      ? "bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600"
      : "bg-gradient-to-r from-silver-300 via-silver-400 to-silver-500";

  return (
    <section className="card mt-6 p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Savings goal</p>
          <h2 className="section-heading mt-2">{label} goal</h2>
          <p className="mt-1 text-sm text-silver-500">
            Pick a target weight and watch it fill as you collect.
          </p>
        </div>
        {goal && !editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditing}
              className="btn btn-ghost px-3 py-1.5 text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="btn btn-danger px-3 py-1.5 text-xs"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="mt-5 text-sm text-silver-500">Loading your goal...</p>
      ) : isError ? (
        <div className="mt-5 flex flex-col gap-2 text-sm">
          <p className="text-red-600">
            {getApiErrorMessage(error, "Could not load your goal.")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-ghost w-fit px-3 py-1.5 text-xs"
          >
            Try again
          </button>
        </div>
      ) : !goal && !editing ? (
        <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-ink-900/15 bg-cream-50/60 p-5">
          <p className="text-sm text-silver-500">
            No {lowerLabel} goal yet. Set one to track your progress.
          </p>
          <button
            type="button"
            onClick={startEditing}
            className="btn btn-gold px-3 py-2 text-sm"
          >
            Set a goal
          </button>
        </div>
      ) : goal && !editing ? (
        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <p className="font-display text-3xl font-semibold tracking-tight text-ink-950">
              {formatGrams(goal.balance_grams)}{" "}
              <span className="font-sans text-sm font-normal text-silver-500">
                of {formatGrams(goal.target_grams)}
              </span>
            </p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                goal.is_complete
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gold-50 text-gold-600"
              }`}
            >
              {goal.progress_percent}%
            </span>
          </div>

          <div
            className="mt-3 h-3 w-full overflow-hidden rounded-full bg-cream-100"
            role="progressbar"
            aria-valuenow={goal.progress_percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} savings goal progress`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressClass}`}
              style={{ width: `${goal.progress_percent}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className={goal.is_complete ? "text-emerald-700" : "text-silver-500"}>
              {goal.is_complete
                ? "Goal reached — keep going if you like."
                : `${formatGrams(goal.remaining_grams)} to go.`}
            </p>
            <p className="text-silver-500">
              Current value{" "}
              <span className="font-semibold text-ink-900">
                {formatRupees(goal.value_paisa)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`goal-grams-${product}`}
              className="label"
            >
              Target weight (grams)
            </label>
            <input
              id={`goal-grams-${product}`}
              type="number"
              inputMode="numeric"
              step={1}
              min={1}
              placeholder="e.g. 10"
              className="input"
              {...register("target_grams", { valueAsNumber: true })}
            />
            {errors.target_grams && (
              <p className="text-xs text-red-600">
                {errors.target_grams.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-gold px-4 py-2 text-sm"
            >
              {saving ? "Saving..." : goal ? "Save goal" : "Create goal"}
            </button>
            {goal && (
              <button
                type="button"
                onClick={cancelEditing}
                className="btn btn-ghost px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
