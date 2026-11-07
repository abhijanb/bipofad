import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAdminCreditMutation } from "../walletApi";
import {
  adminCreditRupeesSchema,
  MAX_ADMIN_CREDIT_RUPEES,
  type AdminCreditRupeesForm,
} from "../schema";
import { formatRupees } from "@/features/vault/format";
import { getApiErrorMessage } from "@/features/app/apiError";

export function WalletCreditAdminCard() {
  const [adminCredit, { isLoading }] = useAdminCreditMutation();
  const idempotencyKey = useRef<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCreditRupeesForm>({
    resolver: zodResolver(adminCreditRupeesSchema),
  });

  function getPendingKey(): string {
    // Reuse the key until a credit succeeds, so retrying a failed request
    // cannot create a second ledger row.
    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }
    return idempotencyKey.current;
  }

  async function onSubmit(values: AdminCreditRupeesForm) {
    try {
      const result = await adminCredit({
        user_email: values.user_email,
        amount_paisa: Math.round(values.amount_rupees * 100),
        description: values.description?.trim() || undefined,
        idempotency_key: getPendingKey(),
      }).unwrap();

      toast.success(
        `${result.message}. Balance ${formatRupees(result.balance_paisa)}`,
      );
      idempotencyKey.current = crypto.randomUUID();
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not credit the wallet"));
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Admin: credit a wallet
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        For testing and support. Every credit is recorded in the wallet ledger.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="credit-email"
              className="text-sm font-medium text-gray-700"
            >
              User email
            </label>
            <input
              id="credit-email"
              type="email"
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
              {...register("user_email")}
            />
            {errors.user_email && (
              <p className="text-xs text-red-600">{errors.user_email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="credit-amount"
              className="text-sm font-medium text-gray-700"
            >
              Amount (Rs)
            </label>
            <input
              id="credit-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max={MAX_ADMIN_CREDIT_RUPEES}
              placeholder="e.g. 100"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
              {...register("amount_rupees", { valueAsNumber: true })}
            />
            {errors.amount_rupees && (
              <p className="text-xs text-red-600">
                {errors.amount_rupees.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="credit-description"
            className="text-sm font-medium text-gray-700"
          >
            Description (optional)
          </label>
          <input
            id="credit-description"
            type="text"
            maxLength={255}
            placeholder="e.g. Test credit"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-fit rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
        >
          {isLoading ? "Crediting..." : "Credit wallet"}
        </button>
      </form>
    </section>
  );
}
