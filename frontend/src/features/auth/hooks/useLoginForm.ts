import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { baseApi } from "@/features/app/baseApi";
import { getApiErrorMessage } from "@/features/app/apiError";
import { useAppDispatch } from "@/features/app/store";
import { useLoginMutation } from "../authApi";
import { setUser } from "../authSlice";
import { loginSchema, type LoginForm } from "../schema";
import { saveRefreshToken, saveToken } from "../storage";

export function useLoginForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginForm) {
    try {
      const data = await login(values).unwrap();
      if (!data.user) {
        toast.error("Login failed: no user returned");
        return;
      }

      saveToken(data.access_token);
      saveRefreshToken(data.refresh_token);
      // Clear anything cached from a previous account before switching over.
      dispatch(baseApi.util.resetApiState());
      dispatch(setUser(data.user));
      toast.success(data.message);
      reset();
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Login failed"));
    }
  }

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
}
