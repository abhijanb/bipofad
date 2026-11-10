import { getApiErrorMessage } from "@/features/app/apiError";
import { useAppSelector } from "@/features/app/store";
import { useProduct } from "@/features/product/hooks/useProduct";
import { useVaultSummaryQuery } from "@/features/vault/vaultApi";
import { useWalletTransactionsQuery } from "@/features/wallet/walletApi";

/** All data and retry handlers needed by the home dashboard. */
export function useHomePage() {
  const user = useAppSelector((state) => state.auth.user);
  const { product } = useProduct();
  const { data, isLoading, isError, error, refetch } =
    useVaultSummaryQuery(product);
  const {
    data: walletTransactions,
    isLoading: isLoadingWallet,
    isError: isWalletError,
    refetch: refetchWallet,
  } = useWalletTransactionsQuery({ limit: 5 });

  const errorDetail = isError
    ? getApiErrorMessage(error, "Could not load your dashboard.")
    : undefined;

  return {
    user,
    product,
    summary: data,
    isLoading,
    isError,
    errorDetail,
    refetch,
    walletTransactions,
    isLoadingWallet,
    isWalletError,
    refetchWallet,
  };
}
