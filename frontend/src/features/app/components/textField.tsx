import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

export function TextField({
  type = "text",
  label,
  placeholder,
  registration,
  error,
}: {
  type?: "text" | "email" | "password";
  label?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 sm:text-sm"
        {...registration}
      />
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}
