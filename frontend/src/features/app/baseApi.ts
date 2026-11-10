import {
  createApi,
  fetchBaseQuery,
  type BaseQueryApi,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { clearUser } from "@/features/auth/authSlice";
import {
  clearTokens,
  loadRefreshToken,
  loadToken,
  saveRefreshToken,
  saveToken,
} from "@/features/auth/storage";
import type { LoginResponse } from "@/features/auth/types";

const API =
  (typeof process !== "undefined" ? process.env.BUN_PUBLIC_API_URL : undefined) ??
  "http://localhost:8000";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API,
  prepareHeaders: (headers) => {
    const token = loadToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

function urlOf(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

// These endpoints either define the session or rotate it; a 401 from them must
// not trigger the refresh-and-retry loop below.
const CREDENTIAL_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

type ExtraOptions = Parameters<typeof rawBaseQuery>[2];

// Single-flight: concurrent 401s share one refresh call. With rotation, a
// second refresh using the same token would fail and wipe the session.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(
  api: BaseQueryApi,
  extraOptions: ExtraOptions,
): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh_token = loadRefreshToken();
    if (!refresh_token) return false;

    const result = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST", body: { refresh_token } },
      api,
      extraOptions,
    );
    const data = result.data as LoginResponse | undefined;
    if (result.error || !data?.access_token || !data.refresh_token) return false;

    saveToken(data.access_token);
    saveRefreshToken(data.refresh_token);
    return true;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

function endSession(api: BaseQueryApi) {
  clearTokens();
  // Never let one account's cached data survive into the next session.
  api.dispatch(baseApi.util.resetApiState());
  api.dispatch(clearUser());
}

/**
 * Retries a request once after refreshing an expired access token. If the
 * refresh fails, the session is cleared so the UI can't stay half-logged-in.
 */
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !CREDENTIAL_PATHS.has(urlOf(args))) {
    if (await refreshSession(api, extraOptions)) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
    if (result.error?.status === 401) endSession(api);
  }

  return result;
};

/**
 * Shared RTK Query API. Feature modules add their endpoints with
 * `baseApi.injectEndpoints({ ... })` so they all use one cache.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Vault", "MetalPrice", "Wallet", "Goal"],
  endpoints: () => ({}),
});
