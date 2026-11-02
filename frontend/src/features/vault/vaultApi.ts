import { baseApi } from "@/features/app/baseApi";
import type {
  CollectSilverInput,
  CollectSilverResponse,
  VaultSummary,
} from "./types";

export const vaultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    vaultSummary: builder.query<VaultSummary, void>({
      query: () => "/vault",
      providesTags: ["Vault"],
    }),
    collectSilver: builder.mutation<CollectSilverResponse, CollectSilverInput>({
      query: (body) => ({
        url: "/vault/collect",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vault"],
    }),
  }),
});

export const { useVaultSummaryQuery, useCollectSilverMutation } = vaultApi;
