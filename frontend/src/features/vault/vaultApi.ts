import { baseApi } from "@/features/app/baseApi";
import type {
  CollectMetalInput,
  CollectMetalResponse,
  PricePoint,
  SellMetalInput,
  SellMetalResponse,
  SetPriceInput,
  VaultProduct,
  VaultSummary,
} from "./types";

export const vaultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    vaultSummary: builder.query<VaultSummary, VaultProduct>({
      query: (product) => `/vault?product=${product}`,
      providesTags: ["Vault"],
    }),
    collectMetal: builder.mutation<CollectMetalResponse, CollectMetalInput>({
      query: (body) => ({
        url: "/vault/collect",
        method: "POST",
        body,
      }),
      // A purchase moves savings-goal progress too.
      invalidatesTags: ["Vault", "Wallet", "Goal"],
    }),
    sellMetal: builder.mutation<SellMetalResponse, SellMetalInput>({
      query: (body) => ({
        url: "/vault/sell",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vault", "Wallet", "Goal"],
    }),
    priceHistory: builder.query<PricePoint[], VaultProduct>({
      query: (product) => `/vault/prices?product=${product}`,
      providesTags: ["MetalPrice"],
    }),
    latestPrice: builder.query<PricePoint | null, VaultProduct>({
      query: (product) => `/vault/prices?product=${product}&limit=1`,
      transformResponse: (points: PricePoint[]) => points.at(-1) ?? null,
      providesTags: (_result, _error, product) => [
        { type: "MetalPrice", id: product },
      ],
      // Hover prices are cheap and rarely change, so keep them for the session.
      keepUnusedDataFor: 3600,
    }),
    setPrice: builder.mutation<PricePoint, SetPriceInput>({
      query: (body) => ({
        url: "/vault/prices",
        method: "POST",
        body,
      }),
      // The summary shows the latest price, so refresh both views together.
      invalidatesTags: ["MetalPrice", "Vault"],
    }),
  }),
});

export const {
  useVaultSummaryQuery,
  useCollectMetalMutation,
  useSellMetalMutation,
  usePriceHistoryQuery,
  useLatestPriceQuery,
  useSetPriceMutation,
} = vaultApi;
