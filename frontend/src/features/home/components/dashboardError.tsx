export function DashboardError({
  detail,
  onRetry,
}: {
  detail: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
          !
        </span>
        <p>{detail}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="btn btn-danger w-fit px-3 py-1.5 text-xs"
      >
        Try again
      </button>
    </div>
  );
}
