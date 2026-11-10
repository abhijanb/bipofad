import { Navbar } from "@/components/navbar";
import { GoalCard } from "@/features/goals/components/goalCard";
import { CollectMetalForm } from "@/features/vault/components/collectMetalForm";
import { MetalPriceAdminCard } from "@/features/vault/components/metalPriceAdminCard";
import { PriceHistoryChart } from "@/features/vault/components/priceHistoryChart";
import { SellMetalForm } from "@/features/vault/components/sellMetalForm";
import { VaultBalanceCard } from "@/features/vault/components/vaultBalanceCard";
import { VaultCollections } from "@/features/vault/components/vaultCollections";
import { VaultSales } from "@/features/vault/components/vaultSales";
import { useVaultPage } from "@/features/vault/hooks/useVaultPage";
import { formatGrams, formatRupees } from "@/features/vault/format";
import { WalletActivity } from "@/features/wallet/components/walletActivity";
import { WalletCreditAdminCard } from "@/features/wallet/components/walletCreditAdminCard";

export function VaultPage() {
  const {
    user,
    product,
    label,
    lowerLabel,
    summary,
    isLoading,
    isError,
    errorDetail,
    refetch,
    prices,
    isLoadingPrices,
    isPricesError,
    walletTransactions,
    isLoadingWallet,
    isWalletError,
    refetchWallet,
  } = useVaultPage();

  const price = summary?.price_per_gram_paisa ?? null;

  return (
    <div className="app-shell">
      <Navbar />

      <main className="page-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your vault</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink-950 sm:text-5xl">
              {label} vault
            </h1>
            <p className="mt-2 max-w-xl text-sm text-silver-500 sm:text-base">
              Collect a little {lowerLabel} at a time, starting from Rs 10.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {price !== null ? `${formatRupees(price)} / g` : "Price unavailable"}
            </span>
            <span className="chip">
              {summary ? formatGrams(summary.balance_grams) : "—"} held
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <VaultBalanceCard
            product={product}
            summary={summary}
            isLoading={isLoading}
            isError={isError}
            errorDetail={errorDetail}
            onRetry={() => refetch()}
          />
          <CollectMetalForm
            product={product}
            pricePerGramPaisa={summary?.price_per_gram_paisa ?? null}
            priceUpdatedAt={summary?.price_updated_at ?? null}
            balancePaisa={summary?.balance_paisa ?? null}
            isLoadingPrice={isLoading}
          />
        </div>

        <div className="mt-6">
          <SellMetalForm
            product={product}
            pricePerGramPaisa={summary?.price_per_gram_paisa ?? null}
            priceUpdatedAt={summary?.price_updated_at ?? null}
            balanceGrams={summary?.balance_grams ?? null}
            minCashoutGrams={summary?.min_cashout_grams ?? null}
            isLoadingVault={isLoading}
          />
        </div>

        <GoalCard product={product} />

        {user?.isSuperuser && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <MetalPriceAdminCard
              product={product}
              currentPricePerGramPaisa={summary?.price_per_gram_paisa ?? null}
            />
            <WalletCreditAdminCard />
          </div>
        )}

        <PriceHistoryChart
          product={product}
          points={prices}
          isLoading={isLoadingPrices}
          isError={isPricesError}
        />

        <VaultCollections
          product={product}
          collections={summary?.collections}
          isLoading={isLoading}
        />

        <VaultSales
          product={product}
          sales={summary?.sales}
          isLoading={isLoading}
        />

        <WalletActivity
          transactions={walletTransactions}
          isLoading={isLoadingWallet}
          isError={isWalletError}
          onRetry={() => refetchWallet()}
        />
      </main>
    </div>
  );
}
