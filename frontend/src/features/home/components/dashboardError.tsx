export function DashboardError({
  detail,
  onRetry,
}: {
  detail: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{detail}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
      >
        Try again
      </button>
    </div>
  );
}
