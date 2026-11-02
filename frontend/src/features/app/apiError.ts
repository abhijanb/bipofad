type ValidationIssue = { msg?: unknown };

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const detail = (error as { data?: { detail?: unknown } } | undefined)?.data
    ?.detail;

  if (typeof detail === "string" && detail.length > 0) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail.flatMap((issue) => {
      if (
        typeof issue === "object" &&
        issue !== null &&
        typeof (issue as ValidationIssue).msg === "string"
      ) {
        return [(issue as { msg: string }).msg];
      }
      return [];
    });

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  return fallback;
}
