import { Link } from "react-router-dom";
import { TextField } from "@/features/app/components/textField";
import { useLoginForm } from "../hooks/useLoginForm";

export function LoginForm() {
  const { register, handleSubmit, errors, isSubmitting } = useLoginForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="card w-full p-6 sm:p-8"
    >
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
        Sign in to HBC
      </h1>
      <p className="mt-2 text-sm text-silver-500">
        Pick up where you left off and keep building your vault.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <TextField
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          registration={register("email")}
          error={errors.email}
        />

        <TextField
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          registration={register("password")}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-gold mt-1 w-full"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-silver-500">
        No account?{" "}
        <Link to="/register" className="font-semibold text-ink-950 underline decoration-gold-400 decoration-2 underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}
