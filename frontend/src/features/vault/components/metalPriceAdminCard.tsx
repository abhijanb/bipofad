import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSetPriceMutation } from "../vaultApi";
import {
  setSilverPriceRupeesSchema,
  type SetSilverPriceRupeesForm,
} from "../schema";
import { formatRupees } from "../format";
import type { VaultProduct } from "../types";
import { getApiErrorMessage } from "@/features/app/apiError";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

export function MetalPriceAdminCard({
  product,
  currentPricePerGramPaisa,
}: {
  product: VaultProduct;
  currentPricePerGramPaisa: number | null;
}) {
  const [setPrice, { isLoading }] = useSetPriceMutation();
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SetSilverPriceRupeesForm>({
    resolver: zodResolver(setSilverPriceRupeesSchema),
  });

  async function onSubmit(values: SetSilverPriceRupeesForm) {
    try {
      const result = await setPrice({
        product,
        price_per_gram_paisa: Math.round(values.price_rupees * 100),
        source: "admin",
      }).unwrap();
      toast.success(
        `${label} price set to ${formatRupees(result.price_per_gram_paisa)} / g`,
      );
      reset();
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, `Could not update the ${lowerLabel} price`),
      );
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Admin: update {lowerLabel} price
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            New {lowerLabel} collections use this rate immediately.
          </p>
        </div>
        {currentPricePerGramPaisa !== null && (
          <p className="text-sm text-gray-600">
            Current:{" "}
            <span className="font-medium text-gray-900">
              {formatRupees(currentPricePerGramPaisa)} / g
            </span>
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="metal-price"
            className="text-sm font-medium text-gray-700"
          >
            Price per gram (Rs)
          </label>
          <input
            id="metal-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder={product === "GOLD" ? "e.g. 12000" : "e.g. 200"}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
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
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50 sm:mt-7"
        >
          {isLoading ? "Saving..." : "Update price"}
        </button>
      </form>
    </section>
  );
}
