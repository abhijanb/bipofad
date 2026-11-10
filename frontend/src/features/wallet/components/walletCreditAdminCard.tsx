import { useWalletCreditAdmin } from "../hooks/useWalletCreditAdmin";

export function WalletCreditAdminCard() {
  const { register, handleSubmit, errors, isLoading, maxAmountRupees } =
    useWalletCreditAdmin();

  return (
    <section className="rounded-3xl border border-gold-400/30 bg-gradient-to-br from-gold-50 via-white to-cream-50 p-6 shadow-card">
      <span className="rounded-full bg-gold-100 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold-600">
        Admin
      </span>
      <h2 className="section-heading mt-3 text-lg">Credit a wallet</h2>
      <p className="mt-1 text-sm text-silver-500">
        For testing and support. Every credit is recorded in the wallet ledger.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="credit-email" className="label">
              User email
            </label>
            <input
              id="credit-email"
              type="email"
              placeholder="user@example.com"
              className="input"
              {...register("user_email")}
            />
            {errors.user_email && (
              <p className="text-xs text-red-600">{errors.user_email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="credit-amount" className="label">
              Amount (Rs)
            </label>
            <input
              id="credit-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max={maxAmountRupees}
              placeholder="e.g. 100"
              className="input"
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
          <label htmlFor="credit-description" className="label">
            Description (optional)
          </label>
          <input
            id="credit-description"
            type="text"
            maxLength={255}
            placeholder="e.g. Test credit"
            className="input"
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
          className="btn btn-primary w-fit"
        >
          {isLoading ? "Crediting..." : "Credit wallet"}
        </button>
      </form>
    </section>
  );
}
