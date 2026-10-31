import { useEffect } from "react";
import { useAppDispatch } from "@/features/app/store";
import { authApi } from "./authApi";
import { clearUser, setUser } from "./authSlice";
import { clearTokens, loadToken } from "./storage";

/** Revalidates the stored token against the API before the guard trusts it. */
export function SessionValidator() {
  const dispatch = useAppDispatch();
  const { data, isError } = authApi.useMeQuery(undefined, {
    skip: !loadToken(),
  });

  useEffect(() => {
    if (!data?.user) return;
    dispatch(setUser(data.user));
  }, [data, dispatch]);

  useEffect(() => {
    if (!isError) return;
    clearTokens();
    dispatch(clearUser());
  }, [isError, dispatch]);

  return null;
}
