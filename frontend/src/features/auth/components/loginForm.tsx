import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "../authApi";
import { loginSchema, type LoginForm } from "../schema";
import { saveUser } from "../session";
import { useAppDispatch } from "@/features/app/store";
import { setUser } from "../authSlice";
import { TextField } from "@/features/app/components/textField";

export function LoginForm() {
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
      saveUser(data.user);
      dispatch(setUser(data.user));
      toast.success(data.message);
      reset();
      navigate("/", { replace: true });
    } catch (error) {
      const detail = (error as { data?: { detail?: string } }).data?.detail;
      toast.error(detail ?? "Login failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">Login</h1>
        <p className="text-sm text-gray-500">Sign in to your account</p>
      </div>

      <TextField
        label="Username"
        placeholder="Enter your username"
        registration={register("username")}
        error={errors.username}
      />

      <TextField
        type="password"
        label="Password"
        placeholder="Enter your password"
        registration={register("password")}
        error={errors.password}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </button>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <Link to="/register" className="font-medium text-gray-900 underline">
          Register
        </Link>
      </p>
    </form>
  );
}
