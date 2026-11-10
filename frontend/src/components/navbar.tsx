import { NavLink } from "react-router-dom";
import { AppHeader } from "@/features/app/components/appHeader";

export function NavigationLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-2 py-1.5 text-[0.7rem] font-medium transition sm:px-3 sm:text-sm ${
          isActive
            ? "bg-ink-950 text-white shadow-sm"
            : "text-ink-600 hover:bg-white/80 hover:text-ink-950"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export function Navbar() {
  return (
    <AppHeader>
      <nav className="flex items-center gap-1 rounded-full border border-ink-900/10 bg-white/50 p-0.5">
        <NavigationLink to="/vault">Vault</NavigationLink>
        <NavigationLink to="/progress">Progress</NavigationLink>
      </nav>
    </AppHeader>
  );
}

export default Navbar;
