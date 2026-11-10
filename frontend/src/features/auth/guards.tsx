import type { ReactNode } from "react";
import { useGuard } from "./hooks/useGuard";

export function Guard({
  admin = false,
  children,
}: {
  admin?: boolean;
  children: ReactNode;
}) {
  const { checking, allowed } = useGuard(admin);

  // A stored token is being checked with /auth/me; don't render or redirect yet.
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 px-6">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-ink-900/10 border-t-gold-500" />
          <p className="text-sm text-silver-500">Checking your session...</p>
        </div>
      </div>
    );
  }

  return allowed ? <>{children}</> : null;
}
