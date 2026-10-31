import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegisterMutation } from "../authApi";
import { registerSchema, type RegisterForm } from "../schema";
import { TextField } from "@/features/app/components/textField";

type ConflictData = {
  detail?: string;
  suggested_usernames?: string[];
  suggested_email?: string[];
};

type Suggestion = { field: "username" | "email"; value: string };

export function RegisterForm() {
  const navigate = useNavigate();
  const [registerUser] = useRegisterMutation();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterForm) {
    setSuggestions([]);

    try {
      const data = await registerUser(values).unwrap();
      toast.success(data.message);
      reset();
      navigate("/login", { replace: true });
    } catch (error) {
      const data = (error as { data?: ConflictData }).data;

      setSuggestions([
        ...(data?.suggested_usernames ?? []).map((value) => ({
          field: "username" as const,
          value,
        })),
        ...(data?.suggested_email ?? []).map((value) => ({
          field: "email" as const,
          value,
        })),
      ]);

      toast.error(data?.detail ?? "Registration failed");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">Register</h1>
        <p className="text-sm text-gray-500">Create your account</p>
      </div>

      <TextField
        label="Username"
        placeholder="Choose a username"
        registration={register("username")}
        error={errors.username}
      />

      <TextField
        type="email"
        label="Email"
        placeholder="you@example.com"
        registration={register("email")}
        error={errors.email}
      />

      <TextField
        type="password"
        label="Password"
        placeholder="At least 6 characters"
        registration={register("password")}
        error={errors.password}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Register"}
      </button>

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg bg-amber-50 p-3 text-sm">
          <p className="font-medium text-gray-800">Already taken. Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.field}:${suggestion.value}`}
                type="button"
                onClick={() => setValue(suggestion.field, suggestion.value)}
                className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs text-gray-800 transition hover:bg-amber-100"
              >
                {suggestion.value}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-gray-900 underline">
          Login
        </Link>
      </p>
    </form>
  );
}
