import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/features/app/store";

/**
 * Route protection logic. Returns whether the session is still being checked
 * and whether the current user may see the guarded content.
 */
export function useGuard(admin = false) {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);
  const allowed =
    status === "authenticated" && (admin ? user?.isSuperuser === true : true);

  useEffect(() => {
    if (status === "anonymous") navigate("/login", { replace: true });
    else if (status === "authenticated" && !allowed)
      navigate("/", { replace: true });
  }, [status, allowed, navigate]);

  return {
    checking: status === "checking",
    allowed,
  };
}
