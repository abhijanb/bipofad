import { getApiErrorMessage } from "@/features/app/apiError";
import { useAppSelector } from "@/features/app/store";
import { useProduct } from "@/features/product/hooks/useProduct";
import { useWalletTransactionsQuery } from "@/features/wallet/walletApi";
import { usePriceHistoryQuery, useVaultSummaryQuery } from "../vaultApi";

/** All data and retry handlers needed by the vault page. */
export function useVaultPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { product, label, lowerLabel } = useProduct();
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

  return {
    user,
    product,
    label,
    lowerLabel,
    summary: data,
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
  };
}
