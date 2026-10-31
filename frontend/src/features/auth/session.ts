import { useEffect } from "react";
import { useAppDispatch } from "@/features/app/store";
import { hydrate } from "./authSlice";
import type { AuthUser } from "./types";

const KEY = "hbc.auth.user";

export function loadUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    window.localStorage.removeItem(KEY);
    return null;
  }
}

export function saveUser(user: AuthUser) {
  window.localStorage.setItem(KEY, JSON.stringify(user));
}

export function forgetUser() {
  window.localStorage.removeItem(KEY);
}

/** Puts the persisted session back into Redux before any guard decides. */
export function AuthHydrator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrate(loadUser()));
  }, [dispatch]);

  return null;
}
