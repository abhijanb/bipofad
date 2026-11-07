import { Link } from "react-router-dom";
import { AppHeader } from "@/features/app/components/appHeader";
import { useAppSelector } from "@/features/app/store";
import { selectProduct } from "@/features/product/productSlice";
import {
  productLowerLabel,
  productLabel,
} from "@/features/product/product";
import { CollectMetalForm } from "@/features/vault/components/collectMetalForm";
import { MetalPriceAdminCard } from "@/features/vault/components/metalPriceAdminCard";
import { PriceHistoryChart } from "@/features/vault/components/priceHistoryChart";
import { SellMetalForm } from "@/features/vault/components/sellMetalForm";
import { VaultBalanceCard } from "@/features/vault/components/vaultBalanceCard";
import { VaultCollections } from "@/features/vault/components/vaultCollections";
import { VaultSales } from "@/features/vault/components/vaultSales";
import {
  usePriceHistoryQuery,
  useVaultSummaryQuery,
} from "@/features/vault/vaultApi";
import { WalletActivity } from "@/features/wallet/components/walletActivity";
import { WalletCreditAdminCard } from "@/features/wallet/components/walletCreditAdminCard";
import { useWalletTransactionsQuery } from "@/features/wallet/walletApi";
import { getApiErrorMessage } from "@/features/app/apiError";

export function VaultPage() {
  const user = useAppSelector((state) => state.auth.user);
  const product = useAppSelector(selectProduct);
  const label = productLabel(product);
  const lowerLabel = productLowerLabel(product);
  const { data, isLoading, isError, error, refetch } =
    useVaultSummaryQuery(product);
  const {
    data: prices,
    isLoading: isLoadingPrices,
    isError: isPricesError,
  } = usePriceHistoryQuery(product);
  const {
    data: walletTransactions,
    isLoading: isLoadingWallet,
    isError: isWalletError,
    refetch: refetchWallet,
  } = useWalletTransactionsQuery({ limit: 20 });
  const errorDetail = isError
    ? getApiErrorMessage(error, "Could not load your vault.")
    : undefined;

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Link
          to="/"
          className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          Home
        </Link>
      </AppHeader>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-gray-900">
            {label} Vault
          </h1>
          <p className="text-gray-600">
            Collect a little {lowerLabel} at a time, starting from Rs 10.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <VaultBalanceCard
            product={product}
            summary={data}
            isLoading={isLoading}
            isError={isError}
            errorDetail={errorDetail}
            onRetry={() => refetch()}
          />
          <CollectMetalForm
            product={product}
            pricePerGramPaisa={data?.price_per_gram_paisa ?? null}
            priceUpdatedAt={data?.price_updated_at ?? null}
            balancePaisa={data?.balance_paisa ?? null}
            isLoadingPrice={isLoading}
          />
        </div>

        <div className="mt-6">
          <SellMetalForm
            product={product}
            pricePerGramPaisa={data?.price_per_gram_paisa ?? null}
            priceUpdatedAt={data?.price_updated_at ?? null}
            balanceGrams={data?.balance_grams ?? null}
            minCashoutGrams={data?.min_cashout_grams ?? null}
            isLoadingVault={isLoading}
          />
        </div>

        {user?.isSuperuser && (
          <>
            <MetalPriceAdminCard
              product={product}
              currentPricePerGramPaisa={data?.price_per_gram_paisa ?? null}
            />
            <WalletCreditAdminCard />
          </>
        )}

        <PriceHistoryChart
          product={product}
          points={prices}
          isLoading={isLoadingPrices}
          isError={isPricesError}
        />

        <VaultCollections
          product={product}
          collections={data?.collections}
          isLoading={isLoading}
        />

        <VaultSales
          product={product}
          sales={data?.sales}
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
