import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "./types";

type AuthState = {
  user: AuthUser | null;
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.initialized = true;
    },
    clearUser(state) {
      state.user = null;
      state.initialized = true;
    },
    /** Restores the persisted session (or marks auth as resolved when there is none). */
    hydrate(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.initialized = true;
    },
  },
});

export const { setUser, clearUser, hydrate } = authSlice.actions;
export const authReducer = authSlice.reducer;
