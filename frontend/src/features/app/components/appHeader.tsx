import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { BrandMark } from "@/features/app/components/brandMark";
import { ProductSwitcher } from "@/features/app/components/productSwitcher";

export function AppHeader({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-cream-50/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandMark />
          <span className="hidden h-6 w-px bg-ink-900/10 sm:block" />
          <ProductSwitcher />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {children}
          <div className="hidden items-center gap-2 rounded-full border border-ink-900/10 bg-white/60 py-1 pl-1 pr-3 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-950 text-xs font-semibold text-gold-300">
              {initial}
            </span>
            <span className="max-w-[9rem] truncate text-sm font-medium text-ink-700">
              {user?.username}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="btn btn-ghost px-2.5 py-2 text-xs sm:px-3 sm:py-1.5"
          >
            <LogOut className="h-4 w-4 sm:hidden" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
