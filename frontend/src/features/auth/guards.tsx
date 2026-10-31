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
  const status = useAppSelector((state) => state.auth.status);
  const allowed =
    status === "authenticated" && (admin ? user?.isSuperuser === true : true);

  useEffect(() => {
    if (status === "anonymous") navigate("/login", { replace: true });
    else if (status === "authenticated" && !allowed) navigate("/", { replace: true });
  }, [status, allowed, navigate]);

  // A stored token is being checked with /auth/me; don't render or redirect yet.
  if (status === "checking") return null;

  return allowed ? <>{children}</> : null;
}
