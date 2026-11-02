import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCollectSilverMutation } from "../vaultApi";
import {
  collectSilverRupeesSchema,
  type CollectSilverRupeesForm,
} from "../schema";
import { formatGrams, formatRupees } from "../format";
import { getApiErrorMessage } from "@/features/app/apiError";

const PRESETS = [10, 50, 100, 500];

export function CollectSilverForm({
  pricePerGramPaisa,
  balancePaisa,
  isLoadingPrice,
}: {
  pricePerGramPaisa: number | null;
  balancePaisa: number | null;
  isLoadingPrice: boolean;
}) {
  const [collectSilver, { isLoading: isCollecting }] =
    useCollectSilverMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<CollectSilverRupeesForm>({
    resolver: zodResolver(collectSilverRupeesSchema),
  });

  const amountRupees = watch("amount_rupees");
  const hasPrice = pricePerGramPaisa !== null && pricePerGramPaisa > 0;
  const amountPaisa = Number.isFinite(amountRupees)
    ? Math.round(amountRupees * 100)
    : 0;
  const insufficient =
    balancePaisa !== null && amountPaisa > 0 && amountPaisa > balancePaisa;
  const estimatedGrams =
    hasPrice && Number.isFinite(amountRupees)
      ? (amountRupees * 100) / pricePerGramPaisa
      : null;

  async function onSubmit(values: CollectSilverRupeesForm) {
    const requestedPaisa = Math.round(values.amount_rupees * 100);
    if (balancePaisa !== null && requestedPaisa > balancePaisa) {
      setError("amount_rupees", { message: "Insufficient balance" });
      return;
    }

    try {
      const result = await collectSilver({
        amount_paisa: requestedPaisa,
      }).unwrap();
      toast.success(result.message);
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not collect silver"));
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Collect silver</h2>
      <p className="mt-1 text-sm text-gray-500">
        Enter an amount between Rs 10 and Rs 1,00,000.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() =>
                setValue("amount_rupees", amount, { shouldValidate: true })
              }
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Rs {amount}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="amount"
              className="text-sm font-medium text-gray-700"
            >
              Amount (Rs)
            </label>
            {balancePaisa !== null && (
              <span className="text-xs text-gray-500">
                Available {formatRupees(balancePaisa)}
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
            {...register("amount_rupees", { valueAsNumber: true })}
          />
          {errors.amount_rupees ? (
            <p className="text-xs text-red-600">{errors.amount_rupees.message}</p>
          ) : insufficient ? (
            <p className="text-xs text-red-600">Insufficient balance</p>
          ) : null}
        </div>

        {isLoadingPrice ? (
          <p className="text-sm text-gray-500">Loading silver price...</p>
        ) : !hasPrice ? (
          <p className="text-sm text-gray-500">
            The current silver price is unavailable.
          </p>
        ) : estimatedGrams !== null ? (
          <p className="text-sm text-gray-500">
            You will collect about{" "}
            <span className="font-medium text-gray-900">
              {formatGrams(estimatedGrams)}
            </span>{" "}
            of silver.
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Enter an amount to estimate the silver you will get.
          </p>
        )}

        <button
          type="submit"
          disabled={
            isCollecting || !hasPrice || balancePaisa === null || insufficient
          }
          className="w-full rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
        >
          {isCollecting ? "Collecting..." : "Collect silver"}
        </button>
      </form>
    </section>
  );
}
