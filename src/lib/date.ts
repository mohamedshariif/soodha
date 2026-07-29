export function parseDateInputToTransactionDate(value?: string | null) {
  if (!value?.trim()) {
    const now = new Date();

    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Date must be in YYYY-MM-DD format.");
  }

  const [year, month, day] = value.split("-").map(Number);

  // Store date-only values at noon UTC.
  // This avoids timezone shifting the date backward or forward.
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function formatDateForInput(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(date: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getTodayDateInputValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}