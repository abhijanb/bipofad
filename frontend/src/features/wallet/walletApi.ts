import { baseApi } from "@/features/app/baseApi";
import type {
  AdminCreditInput,
  AdminCreditResponse,
  WalletTransaction,
} from "./types";

export type WalletTransactionsArgs = {
  limit?: number;
  beforeId?: number;
};

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    walletTransactions: builder.query<
      WalletTransaction[],
      WalletTransactionsArgs
    >({
      query: ({ limit, beforeId }) => ({
        url: "/wallet/transactions",
        params: {
          ...(limit !== undefined && { limit }),
          ...(beforeId !== undefined && { before_id: beforeId }),
        },
      }),
      providesTags: ["Wallet"],
    }),
    adminCredit: builder.mutation<AdminCreditResponse, AdminCreditInput>({
      query: (body) => ({
        url: "/wallet/credit",
        method: "POST",
        body,
      }),
      // A credit changes both the wallet history and the vault balance.
      invalidatesTags: ["Wallet", "Vault"],
    }),
  }),
});

export const { useWalletTransactionsQuery, useAdminCreditMutation } = walletApi;
