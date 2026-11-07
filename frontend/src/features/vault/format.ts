import { format } from "date-fns";
import { enIN } from "date-fns/locale";

export function formatRupees(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function formatSignedRupees(paisa: number) {
  if (paisa === 0) return formatRupees(0);
  const sign = paisa > 0 ? "+" : "-";
  return `${sign}${formatRupees(Math.abs(paisa))}`;
}

export function formatGrams(grams: number | string) {
  return `${Number(grams).toLocaleString("en-IN", {
    maximumFractionDigits: 3,
  })} g`;
}

export function formatDate(value: string) {
  return format(new Date(value), "d MMM yyyy", { locale: enIN });
}

export function formatDateTime(value: string) {
  return format(new Date(value), "d MMM yyyy, h:mm a", { locale: enIN });
}
