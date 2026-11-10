import { Plus } from "lucide-react";
import { formatDateTime, formatGrams, formatRupees } from "../format";
import type { VaultProduct } from "../types";
import { useCollectMetalForm } from "../hooks/useCollectMetalForm";

export function CollectMetalForm({
  product,
  pricePerGramPaisa,
  priceUpdatedAt,
  balancePaisa,
  isLoadingPrice,
}: {
  product: VaultProduct;
  pricePerGramPaisa: number | null;
  priceUpdatedAt: string | null;
  balancePaisa: number | null;
  isLoadingPrice: boolean;
}) {
  const {
    presets,
    lowerLabel,
    register,
    handleSubmit,
    errors,
    amountPaisa,
    estimatedGrams,
    estimatedPaisa,
    tooSmall,
    insufficient,
    hasPrice,
    isLoadingPrice: loadingPrice,
    priceUpdatedAt: updatedAt,
    balancePaisa: balance,
    isCollecting,
    canSubmit,
    selectPreset,
  } = useCollectMetalForm({
    product,
    pricePerGramPaisa,
    priceUpdatedAt,
    balancePaisa,
    isLoadingPrice,
  });

  return (
    <section className="card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Add to vault</p>
          <h2 className="section-heading mt-2">Collect {lowerLabel}</h2>
          <p className="mt-1 text-sm text-silver-500">
            Enter an amount between Rs 10 and Rs 1,00,000.
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold-100 text-gold-600">
          <Plus className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => selectPreset(amount)}
              className="preset"
            >
              Rs {amount}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="amount" className="label">
              Amount (Rs)
            </label>
            {balance !== null && (
              <span className="text-xs text-silver-500">
                Available {formatRupees(balance)}
              </span>
            )}
          </div>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={10}
            max={100000}
            placeholder="e.g. 100"
            className="input"
            {...register("amount_rupees", { valueAsNumber: true })}
          />
          {errors.amount_rupees ? (
            <p className="text-xs text-red-600">{errors.amount_rupees.message}</p>
          ) : insufficient ? (
            <p className="text-xs text-red-600">Insufficient balance</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-ink-900/10 bg-cream-50/70 p-4 text-sm">
          {loadingPrice ? (
            <p className="text-silver-500">Loading {lowerLabel} price...</p>
          ) : !hasPrice ? (
            <p className="text-silver-500">
              The current {lowerLabel} price is unavailable.
            </p>
          ) : tooSmall ? (
            <p className="text-red-600">
              That amount buys less than 1 g at the current rate.
            </p>
          ) : estimatedGrams !== null && estimatedPaisa !== null ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-silver-500">You will collect</span>
                <span className="font-semibold text-ink-950">
                  {formatGrams(estimatedGrams)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-silver-500">For</span>
                <span className="font-semibold text-ink-950">
                  {formatRupees(estimatedPaisa)}
                </span>
              </div>
              {estimatedPaisa < amountPaisa && (
                <p className="mt-2 text-xs text-silver-500">
                  {formatRupees(amountPaisa - estimatedPaisa)} stays in your
                  wallet.
                </p>
              )}
            </>
          ) : (
            <p className="text-silver-500">
              Enter an amount to estimate the {lowerLabel} you will get.
            </p>
          )}
        </div>

        {hasPrice && updatedAt && (
          <p className="text-xs text-silver-400">
            Rate as of {formatDateTime(updatedAt)}
          </p>
        )}

        <button type="submit" disabled={!canSubmit} className="btn btn-gold w-full">
          {isCollecting ? `Collecting ${lowerLabel}...` : `Collect ${lowerLabel}`}
        </button>
      </form>
    </section>
  );
}
