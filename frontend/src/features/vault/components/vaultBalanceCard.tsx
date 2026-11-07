import { formatDateTime, formatGrams, formatRupees } from "../format";
import type { VaultProduct, VaultSummary } from "../types";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

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
  const price = summary?.price_per_gram_paisa ?? null;
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">Wallet balance</p>

      {isLoading ? (
        <p className="mt-2 text-sm text-gray-500">Loading vault...</p>
      ) : summary ? (
        <>
          <p className="mt-1 text-4xl font-semibold tracking-tight text-gray-900">
            {formatRupees(summary.balance_paisa)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Available to buy {lowerLabel} at any time.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {label} balance
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {formatGrams(summary.balance_grams)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {label} value
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {formatRupees(summary.value_paisa)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Price
              </p>
              <p className="mt-0.5 text-sm font-medium text-gray-900">
                {price !== null ? `${formatRupees(price)} / g` : "—"}
              </p>
              {summary.price_updated_at && (
                <p className="mt-0.5 text-xs text-gray-400">
                  As of {formatDateTime(summary.price_updated_at)}
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}

      {isError && (
        <div className="mt-2 flex flex-col gap-2 text-sm">
          <p className="text-red-600">
            {errorDetail ?? "Could not load your vault."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="w-fit rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}
