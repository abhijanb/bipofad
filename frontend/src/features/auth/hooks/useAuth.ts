import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { baseApi } from "@/features/app/baseApi";
import { useAppDispatch, useAppSelector } from "@/features/app/store";
import { useLogoutMutation } from "../authApi";
import { clearUser } from "../authSlice";
import { clearTokens, loadRefreshToken } from "../storage";

/**
 * Central auth state and actions. Components read the session through this
 * hook instead of touching the store, storage, or logout endpoint directly.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status } = useAppSelector((state) => state.auth);
  const [logoutRequest] = useLogoutMutation();

  const isAuthenticated = status === "authenticated";
  const isChecking = status === "checking";
  const isSuperuser = user?.isSuperuser === true;

  async function logout() {
    const refresh_token = loadRefreshToken();
    if (refresh_token) {
      // Best effort: revoke server-side, but never block the local logout.
      try {
        await logoutRequest({ refresh_token }).unwrap();
      } catch {
        // ignore
      }
    }

    clearTokens();
    // Drop cached vault/wallet data so the next account can't see it.
    dispatch(baseApi.util.resetApiState());
    dispatch(clearUser());
    toast.success("Logged out");
    navigate("/login", { replace: true });
  }

  return {
    user,
    status,
    isAuthenticated,
    isChecking,
    isSuperuser,
    logout,
  };
}
