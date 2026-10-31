import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { loadToken } from "./storage";
import type { AuthUser } from "./types";

type AuthStatus = "checking" | "authenticated" | "anonymous";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
};

const initialState: AuthState = {
  // Only the token is persisted. The user is always re-fetched from
  // /auth/me, so a forged localStorage entry cannot authenticate anyone.
  user: null,
  status: loadToken() ? "checking" : "anonymous",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearUser(state) {
      state.user = null;
      state.status = "anonymous";
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
