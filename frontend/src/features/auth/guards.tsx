import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/features/app/store";

export function Guard({
  admin = false,
  children,
}: {
  admin?: boolean;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const initialized = useAppSelector((state) => state.auth.initialized);
  const allowed = admin ? user?.isSuperuser === true : user !== null;

  useEffect(() => {
    // Wait until the persisted session has been read, otherwise a refresh
    // would bounce an authenticated user back to /login.
    if (initialized && !allowed) navigate("/login", { replace: true });
  }, [initialized, allowed, navigate]);

  if (!initialized) return null;

  return allowed ? <>{children}</> : null;
}
