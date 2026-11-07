import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSellMetalMutation } from "../vaultApi";
import { sellGramsSchema, type SellGramsForm } from "../schema";
import { formatDateTime, formatGrams, formatRupees } from "../format";
import type { VaultProduct } from "../types";
import { getApiErrorMessage } from "@/features/app/apiError";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";

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
  balanceGrams: string | null;
  minCashoutGrams: string | null;
  isLoadingVault: boolean;
}) {
  const [sellMetal, { isLoading: isSelling }] = useSellMetalMutation();
  const pendingKey = useRef<{
    key: string;
    grams: string;
    product: VaultProduct;
  } | null>(null);
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);

  function getIdempotencyKey(grams: string): string {
    // Reuse the key only for the same metal and weight. A retry cannot
    // double-sell, while changing either starts a new request.
    if (
      !pendingKey.current ||
      pendingKey.current.grams !== grams ||
      pendingKey.current.product !== product
    ) {
      pendingKey.current = {
        key: crypto.randomUUID(),
        grams,
        product,
      };
    }
    return pendingKey.current.key;
  }

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<SellGramsForm>({
    resolver: zodResolver(sellGramsSchema),
  });

  const gramsText = watch("grams");
  const grams = Number(gramsText);
  const hasPrice = pricePerGramPaisa !== null && pricePerGramPaisa > 0;
  const balance = Number(balanceGrams ?? 0);
  const minimum = Number(minCashoutGrams ?? 0);
  const isValidNumber = Number.isFinite(grams) && grams > 0;
  const belowMinimum = isValidNumber && minimum > 0 && grams < minimum;
  const aboveBalance = isValidNumber && balanceGrams !== null && grams > balance;
  const estimatedPaisa =
    hasPrice && isValidNumber
      ? Math.floor(grams * pricePerGramPaisa)
      : null;
  const cannotMeetMinimum = balanceGrams !== null && balance < minimum;

  async function onSubmit(values: SellGramsForm) {
    const requestedGrams = Number(values.grams);
    if (minimum > 0 && requestedGrams < minimum) {
      setError("grams", {
        message: `Minimum cash-out is ${formatGrams(minimum)}`,
      });
      return;
    }
    if (balanceGrams !== null && requestedGrams > balance) {
      setError("grams", { message: "Not enough metal to cash out" });
      return;
    }

    try {
      const result = await sellMetal({
        product,
        grams: values.grams,
        idempotency_key: getIdempotencyKey(values.grams),
      }).unwrap();
      pendingKey.current = null;
      toast.success(result.message);
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, `Could not cash out ${lowerLabel}`));
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Cash out {lowerLabel}
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Sell part of your holding back to the vault. The money is added to your
        wallet immediately.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[0.25, 0.5, 1].map((fraction) => {
            const preset = balance * fraction;
            if (preset <= 0) return null;
            return (
              <button
                key={fraction}
                type="button"
                onClick={() =>
                  setValue("grams", preset.toFixed(3), {
                    shouldValidate: true,
                  })
                }
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {fraction === 1 ? "Max" : `${fraction * 100}%`}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="sell-grams"
              className="text-sm font-medium text-gray-700"
            >
              Amount (grams)
            </label>
            {balanceGrams !== null && (
              <span className="text-xs text-gray-500">
                Available {formatGrams(balanceGrams)}
              </span>
            )}
          </div>
          <input
            id="sell-grams"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 1.000"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
            {...register("grams")}
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

        {isLoadingVault ? (
          <p className="text-sm text-gray-500">Loading your holding...</p>
        ) : cannotMeetMinimum ? (
          <p className="text-sm text-gray-500">
            You need at least {formatGrams(minimum)} to cash out. You currently
            have {formatGrams(balance)}.
          </p>
        ) : isLoadingVault || !hasPrice ? (
          <p className="text-sm text-gray-500">
            The current {lowerLabel} price is unavailable.
          </p>
        ) : estimatedPaisa !== null ? (
          <p className="text-sm text-gray-500">
            You will receive about{" "}
            <span className="font-medium text-gray-900">
              {formatRupees(estimatedPaisa)}
            </span>{" "}
            in your wallet.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Enter grams to estimate your wallet credit.
          </p>
        )}

        {minCashoutGrams !== null && (
          <p className="text-xs text-gray-400">
            Minimum cash-out: {formatGrams(minCashoutGrams)} of {lowerLabel}.
          </p>
        )}

        {hasPrice && priceUpdatedAt && (
          <p className="text-xs text-gray-400">
            Rate as of {formatDateTime(priceUpdatedAt)}
          </p>
        )}

        <button
          type="submit"
          disabled={
            isSelling ||
            isLoadingVault ||
            !hasPrice ||
            balanceGrams === null ||
            cannotMeetMinimum ||
            !isValidNumber ||
            belowMinimum ||
            aboveBalance
          }
          className="w-full rounded-lg border border-gray-900 px-3 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {isSelling ? `Cashing out ${lowerLabel}...` : `Cash out ${lowerLabel}`}
        </button>
      </form>
    </section>
  );
}
