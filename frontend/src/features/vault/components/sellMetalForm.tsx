import { ArrowUpRight } from "lucide-react";
import { formatDateTime, formatGrams, formatRupees } from "../format";
import type { VaultProduct } from "../types";
import { useSellMetalForm } from "../hooks/useSellMetalForm";

export function SellMetalForm({
  product,
  pricePerGramPaisa,
  priceUpdatedAt,
  balanceGrams,
  minCashoutGrams,
  isLoadingVault,
}: {
  product: VaultProduct;
  pricePerGramPaisa: number | null;
  priceUpdatedAt: string | null;
  balanceGrams: number | null;
  minCashoutGrams: number | null;
  isLoadingVault: boolean;
}) {
  const {
    presets,
    lowerLabel,
    register,
    handleSubmit,
    errors,
    estimatedPaisa,
    belowMinimum,
    aboveBalance,
    cannotMeetMinimum,
    hasPrice,
    isLoadingVault: loadingVault,
    priceUpdatedAt: updatedAt,
    balanceGrams: balance,
    minCashoutGrams: minimumCashout,
    isSelling,
    canSubmit,
    selectPreset,
    minimum,
    balance: heldGrams,
  } = useSellMetalForm({
    product,
    pricePerGramPaisa,
    priceUpdatedAt,
    balanceGrams,
    minCashoutGrams,
    isLoadingVault,
  });

  return (
    <section className="card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Cash out</p>
          <h2 className="section-heading mt-2">Sell {lowerLabel}</h2>
          <p className="mt-1 text-sm text-silver-500">
            Sell part of your holding back to the vault. The money is added to
            your wallet immediately.
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-silver-200 text-ink-700">
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.fraction}
              type="button"
              onClick={() => selectPreset(preset.grams)}
              className="preset"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sell-grams" className="label">
              Amount (grams)
            </label>
            {balance !== null && (
              <span className="text-xs text-silver-500">
                Available {formatGrams(balance)}
              </span>
            )}
          </div>
          <input
            id="sell-grams"
            type="number"
            inputMode="numeric"
            step={1}
            min={1}
            placeholder="e.g. 1"
            className="input"
            {...register("grams", { valueAsNumber: true })}
          />
          {errors.grams ? (
            <p className="text-xs text-red-600">{errors.grams.message}</p>
          ) : belowMinimum ? (
            <p className="text-xs text-red-600">
              Minimum cash-out is {formatGrams(minimum)}.
            </p>
          ) : aboveBalance ? (
            <p className="text-xs text-red-600">
              Not enough {lowerLabel} to cash out.
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-ink-900/10 bg-cream-50/70 p-4 text-sm">
          {loadingVault ? (
            <p className="text-silver-500">Loading your holding...</p>
          ) : cannotMeetMinimum ? (
            <p className="text-silver-500">
              You need at least {formatGrams(minimum)} to cash out. You currently
              have {formatGrams(heldGrams)}.
            </p>
          ) : !hasPrice ? (
            <p className="text-silver-500">
              The current {lowerLabel} price is unavailable.
            </p>
          ) : estimatedPaisa !== null ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-silver-500">You will receive about</span>
              <span className="font-semibold text-ink-950">
                {formatRupees(estimatedPaisa)}
              </span>
            </div>
          ) : (
            <p className="text-silver-500">
              Enter grams to estimate your wallet credit.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-silver-400">
          {minimumCashout !== null && (
            <span>Minimum cash-out: {formatGrams(minimumCashout)}</span>
          )}
          {hasPrice && updatedAt && <span>Rate as of {formatDateTime(updatedAt)}</span>}
        </div>

        <button type="submit" disabled={!canSubmit} className="btn btn-primary w-full">
          {isSelling ? `Cashing out ${lowerLabel}...` : `Cash out ${lowerLabel}`}
        </button>
      </form>
    </section>
  );
}
