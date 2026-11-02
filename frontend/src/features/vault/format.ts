export function formatRupees(paisa: number) {
  return `Rs ${(paisa / 100).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export function formatGrams(grams: number) {
  return `${grams.toLocaleString("en-IN", { maximumFractionDigits: 3 })} g`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
