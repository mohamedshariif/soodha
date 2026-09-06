const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ATTENTION_WINDOW_DAYS = 7;

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
      return "Repeats weekly";
    case "MONTHLY":
      return "Repeats monthly";
    case "YEARLY":
      return "Repeats yearly";
    default:
      return "One-time";
  }
}
