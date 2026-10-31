import { baseApi } from "@/features/app/baseApi";
import type {
  LoginInput,
  LoginResponse,
  MeResponse,
  RefreshInput,
  RegisterInput,
  RegisterResponse,
} from "./types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterInput>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),
    refresh: builder.mutation<LoginResponse, RefreshInput>({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, RefreshInput>({
      query: (body) => ({
        url: "/auth/logout",
        method: "POST",
        body,
      }),
    }),
    me: builder.query<MeResponse, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;
