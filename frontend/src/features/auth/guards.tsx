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
  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-gray-500">Checking your session...</p>
      </div>
    );
  }

  return allowed ? <>{children}</> : null;
}
