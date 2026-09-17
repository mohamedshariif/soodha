import { createElement } from "react";
import Link from "next/link";
import { MarkBillPaidButton } from "../../bills/_components/mark-bill-paid-button";
import { SectionCard } from "@/components/ui/section-card";
import { formatDateForDisplay, formatDateForInput } from "@/lib/date";
import { guessBillIcon } from "@/lib/icons/bill-icon-suggest";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { CalendarClock } from "lucide-react";

type AttentionBill = {
  id: string;
  name: string;
  amountMinor: bigint;
  currency: string;
  nextDueDate: Date;
  category: { name: string } | null;
};

export function DashboardBill({
  bills,
  today,
}: {
  bills: AttentionBill[];
  today: Date;
}) {
  return (
    <SectionCard
      title="Upcoming bills"
      description="bills that are overdue or due in the next 7 days."
      action={
        <Link
          href="/bills"
          className="font-medium text-primary hover:text-primary-hover"
        >
          View all
        </Link>
      }
    >
      {bills.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg bg-muted/60 p-4">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nothing needs your attention right now.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {bills.map((bill) => {
            const isOverdue = bill.nextDueDate.getTime() < today.getTime();
            const dueLabel = isOverdue
              ? `Overdue . ${formatDateForDisplay(bill.nextDueDate)}`
              : `Due ${formatDateForDisplay(bill.nextDueDate)}`;

            return (
              <div
                key={bill.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                  {createElement(
                    guessBillIcon(bill.name, bill.category?.name),
                    { className: "h-5 w-5" },
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {bill.name}
                  </p>
                  <p
                    className={`mt-0.5 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    {dueLabel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {formatMoneyFromMinorUnits(bill.amountMinor, bill.currency)}
                  </p>
                  <MarkBillPaidButton
                    billId={bill.id}
                    billName={bill.name}
                    dueDate={formatDateForInput(bill.nextDueDate)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-primary hover:text-white cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
