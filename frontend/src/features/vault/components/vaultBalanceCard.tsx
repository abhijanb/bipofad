import { formatDateTime, formatGrams, formatRupees } from "../format";
import type { VaultProduct, VaultSummary } from "../types";
import { useVaultBalanceCard } from "../hooks/useVaultBalanceCard";

export function VaultBalanceCard({
  product,
  summary,
  isLoading,
  isError,
  errorDetail,
  onRetry,
}: {
  product: VaultProduct;
  summary?: VaultSummary;
  isLoading: boolean;
  isError: boolean;
  errorDetail?: string;
  onRetry: () => void;
}) {
  const {
    summary: vault,
    isLoading: loading,
    isError: hasError,
    errorDetail: detail,
    onRetry: retry,
    price,
    label,
    lowerLabel,
  } = useVaultBalanceCard({
    product,
    summary,
    isLoading,
    isError,
    errorDetail,
    onRetry,
  });

  const accent =
    product === "GOLD"
      ? "bg-gold-400/20"
      : "bg-silver-300/20";

  return (
    <section className="card-dark relative overflow-hidden p-6 sm:p-7">
      <div className={`pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full ${accent} blur-3xl`} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-silver-400">
              Wallet balance
            </p>
            {loading ? (
              <p className="mt-3 text-sm text-cream-200/60">Loading vault...</p>
            ) : vault ? (
              <>
                <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-cream-50">
                  {formatRupees(vault.balance_paisa)}
                </p>
                <p className="mt-1 text-sm text-cream-200/60">
                  Available to buy {lowerLabel} at any time.
                </p>
              </>
            ) : null}
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cream-100">
            {label}
          </span>
        </div>

        {vault && !loading && (
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-5">
            <Metric
              label={`${label} balance`}
              value={formatGrams(vault.balance_grams)}
            />
            <Metric
              label={`${label} value`}
              value={formatRupees(vault.value_paisa)}
            />
            <Metric
              label="Price / g"
              value={price !== null ? formatRupees(price) : "—"}
              hint={
                vault.price_updated_at
                  ? `As of ${formatDateTime(vault.price_updated_at)}`
                  : undefined
              }
            />
          </div>
        )}

        {hasError && (
          <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            <p>{detail ?? "Could not load your vault."}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-2 rounded-lg border border-red-300/30 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[0.62rem] uppercase tracking-[0.14em] text-silver-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-cream-100">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 truncate text-[0.62rem] text-cream-200/40">
          {hint}
        </p>
      )}
    </div>
  );
}
