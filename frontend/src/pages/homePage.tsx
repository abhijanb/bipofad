import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/features/app/store";
import { clearUser } from "@/features/auth/authSlice";
import { forgetUser } from "@/features/auth/session";

export function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  function logout() {
    forgetUser();
    dispatch(clearUser());
    toast.success("Logged out");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-gray-900">HBC</span>
          <div className="flex items-center gap-4">
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

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome back, {user?.username}
        </h1>
        <p className="mt-2 text-gray-600">
          You are signed in as {user?.email}.
        </p>
      </main>
    </div>
  );
}
