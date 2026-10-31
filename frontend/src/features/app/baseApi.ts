import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API =
  (typeof process !== "undefined" ? process.env.BUN_PUBLIC_API_URL : undefined) ??
  "http://localhost:8000";

/**
 * Shared RTK Query API. Feature modules add their endpoints with
 * `baseApi.injectEndpoints({ ... })` so they all use one cache.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  endpoints: () => ({}),
});
