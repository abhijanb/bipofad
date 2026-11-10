import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

export function TextField({
  type = "text",
  label,
  placeholder,
  registration,
  error,
  autoComplete,
}: {
  type?: "text" | "email" | "password";
  label?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={registration.name} className="label">
          {label}
        </label>
      )}
      <input
        id={registration.name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input"
        aria-invalid={error ? true : undefined}
        {...registration}
      />
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
