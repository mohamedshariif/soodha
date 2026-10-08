const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ATTENTION_WINDOW_DAYS = 7;

export type RepeatType =
  "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY";

export function isRepeatType(value: FormDataEntryValue | null): value is RepeatType {
  return (
    value === "NONE" ||
    value === "WEEKLY" ||
    value === "MONTHLY" ||
    value === "YEARLY"
  );
}

export function getDaysUntilDue(dueDate: Date, today: Date) {
  return Math.round((dueDate.getTime() - today.getTime()) / MS_PER_DAY);
}

export function getDueStatusLabel(dueDate: Date, today: Date) {
  const days = getDaysUntilDue(dueDate, today);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function getDueStatusClassName(dueDate: Date, today: Date) {
  const days = getDaysUntilDue(dueDate, today);
  if (days < 0) return "bg-red-50 text-red-700";
  if (days <= 3) return "bg-muted text-emerald-700";
  if (days <= ATTENTION_WINDOW_DAYS) return "bg-amber-50 text-amber-700";
  return "bg-muted text-primary";
}

export function isDueSoon(dueDate: Date, today: Date) {
  return getDaysUntilDue(dueDate, today) <= ATTENTION_WINDOW_DAYS;
}

export function groupBillsByStatus<T extends { nextDueDate: Date }>(
  bills: T[],
  today: Date,
) {
  const overdue: T[] = [];
  const upcoming: T[] = [];

  for (const bill of bills) {
    if (getDaysUntilDue(bill.nextDueDate, today) < 0) {
      overdue.push(bill);
    } else {
      upcoming.push(bill);
    }
  }

  return { overdue, upcoming };
}

export function sumAmountsMinor<T extends { amountMinor: bigint }>(items: T[]) {
  return items.reduce((total, item) => total + item.amountMinor, BigInt(0));
}

export function formatRepeatLabel(repeatType: string) {
  switch (repeatType) {
    case "WEEKLY":
      return "Weekly";
    case "MONTHLY":
      return "Monthly";
    case "YEARLY":
      return "Yearly";
    default:
      return "One-time";
  }
}

export function addDaysUtc(date: Date, days: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
      12,
      0,
      0,
      0,
    ),
  );
}

export function addMonthsUtc(date: Date, months: number) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, month + months + 1, 0, 12, 0, 0, 0),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      year,
      month + months,
      Math.min(day, lastDayOfTargetMonth),
      12,
      0,
      0,
      0,
    ),
  );
}

export function getNextDueDate(currentDueDate: Date, repeatType: RepeatType) {
  switch (repeatType) {
    case "WEEKLY":
      return addDaysUtc(currentDueDate, 7);
    case "MONTHLY":
      return addMonthsUtc(currentDueDate, 1);
    case "YEARLY":
      return addMonthsUtc(currentDueDate, 12);
    default:
      return null;
  }
}
