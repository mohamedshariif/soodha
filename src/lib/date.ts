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

export function getCurrentMonthInputValue() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function isMonthInputValue(value?: string | null) {
  return Boolean(value && /^\d{4}-\d{2}$/.test(value));
}

export function parseMonthInputToBudgetPeriod(value?: string | null) {
  const monthValue = isMonthInputValue(value)
    ? value!
    : getCurrentMonthInputValue();

  const [year, month] = monthValue.split("-").map(Number);

  const periodStart = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(year, month, 0, 12, 0, 0, 0));

  return {
    monthValue,
    periodStart,
    periodEnd,
  };
}

export function formatMonthLabel(monthValue: string) {
  const { periodStart } = parseMonthInputToBudgetPeriod(monthValue);

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(periodStart);
}

export function addDaysUtc(date: Date, days: number) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
      12, 0, 0, 0
    )
  );
}