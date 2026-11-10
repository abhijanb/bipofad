import { formatRupees } from "../format";
import type { VaultProduct } from "../types";
import { useMetalPriceAdminCard } from "../hooks/useMetalPriceAdminCard";

export function MetalPriceAdminCard({
  product,
  currentPricePerGramPaisa,
}: {
  product: VaultProduct;
  currentPricePerGramPaisa: number | null;
}) {
  const {
    lowerLabel,
    currentPricePerGramPaisa: currentPrice,
    register,
    handleSubmit,
    errors,
    isLoading,
  } = useMetalPriceAdminCard({ product, currentPricePerGramPaisa });

  return (
    <section className="rounded-3xl border border-gold-400/30 bg-gradient-to-br from-gold-50 via-white to-cream-50 p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
            Admin
          </span>
          <h2 className="section-heading mt-3 text-lg">
            Update {lowerLabel} price
          </h2>
          <p className="mt-1 text-sm text-silver-500">
            New {lowerLabel} collections use this rate immediately.
          </p>
        </div>
        {currentPrice !== null && (
          <p className="rounded-xl border border-gold-400/30 bg-white/70 px-3 py-2 text-sm text-ink-700">
            Current{" "}
            <span className="font-semibold text-ink-950">
              {formatRupees(currentPrice)} / g
            </span>
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="metal-price" className="label">
            Price per gram (Rs)
          </label>
          <input
            id="metal-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder={product === "GOLD" ? "e.g. 12000" : "e.g. 200"}
            className="input"
            {...register("price_rupees", { valueAsNumber: true })}
          />
          {errors.price_rupees && (
            <p className="text-xs text-red-600">
              {errors.price_rupees.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary sm:mt-7"
        >
          {isLoading ? "Saving..." : "Update price"}
        </button>
      </form>
    </section>
  );
}
