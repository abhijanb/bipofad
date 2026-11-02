import { Link } from "react-router-dom";
import { useAppSelector } from "@/features/app/store";
import { AppHeader } from "@/features/app/components/appHeader";

export function HomePage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen">
      <AppHeader>
        <Link
          to="/vault"
          className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
        >
          Silver vault
        </Link>
      </AppHeader>

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
