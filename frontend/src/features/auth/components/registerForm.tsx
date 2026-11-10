import { Link } from "react-router-dom";
import { TextField } from "@/features/app/components/textField";
import { useRegisterForm } from "../hooks/useRegisterForm";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    suggestions,
    applySuggestion,
  } = useRegisterForm();

  return (
    <form onSubmit={handleSubmit} className="card w-full p-6 sm:p-8">
      <p className="eyebrow">Start saving</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-silver-500">
        One account for both your silver and gold vaults.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <TextField
          label="Username"
          placeholder="Choose a username"
          autoComplete="username"
          registration={register("username")}
          error={errors.username}
        />

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
          placeholder="At least 6 characters"
          autoComplete="new-password"
          registration={register("password")}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-gold mt-1 w-full"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 rounded-2xl border border-gold-400/40 bg-gold-50 p-4 text-sm">
          <p className="font-medium text-ink-800">
            Already taken. Try one of these:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.field}:${suggestion.value}`}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="rounded-full border border-gold-400/50 bg-white px-3 py-1 text-xs font-medium text-ink-800 transition hover:bg-gold-100"
              >
                {suggestion.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-silver-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-ink-950 underline decoration-gold-400 decoration-2 underline-offset-4"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
