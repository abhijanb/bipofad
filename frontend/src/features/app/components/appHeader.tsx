import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { baseApi } from "@/features/app/baseApi";
import { useAppDispatch, useAppSelector } from "@/features/app/store";
import { clearUser } from "@/features/auth/authSlice";
import { useLogoutMutation } from "@/features/auth/authApi";
import { clearTokens, loadRefreshToken } from "@/features/auth/storage";

export function AppHeader({ children }: { children?: ReactNode }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutRequest] = useLogoutMutation();

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

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          HBC
        </Link>
        <div className="flex items-center gap-4">
          {children}
          <span className="text-sm text-gray-600">{user?.username}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
