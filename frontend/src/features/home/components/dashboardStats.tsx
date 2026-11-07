import { formatGrams, formatRupees } from "@/features/vault/format";
import type { VaultProduct, VaultSummary } from "@/features/vault/types";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

export function DashboardStats({
  product,
  summary,
  isLoading,
  isError,
}: {
  product: VaultProduct;
  summary?: VaultSummary;
  isLoading: boolean;
  isError: boolean;
}) {
  const showValues = !isLoading && !isError;
  const price = summary?.price_per_gram_paisa ?? null;
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Wallet balance"
        value={showValues ? formatRupees(summary?.balance_paisa ?? 0) : "—"}
        hint={`Available to buy ${lowerLabel}`}
      />
      <StatCard
        label={`${label} held`}
        value={
          showValues ? formatGrams(summary?.balance_grams ?? "0") : "—"
        }
        hint="Across all your collections"
      />
      <StatCard
        label={`${label} value`}
        value={showValues ? formatRupees(summary?.value_paisa ?? 0) : "—"}
        hint={
          isLoading
            ? `Loading ${lowerLabel} price...`
            : price !== null
              ? `${formatRupees(price)} per gram`
              : "Price unavailable"
        }
      />
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  );
}
