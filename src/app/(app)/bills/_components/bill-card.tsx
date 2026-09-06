import { formatDateForDisplay, formatDateForInput } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import {
  getDueStatusLabel,
  getDueStatusClassName,
  formatRepeatLabel,
  isDueSoon,
} from "@/lib/bills";
import { guessBillIcon } from "@/lib/icons/bill-icon-suggest";
import { DeleteBillButton } from "./delete-bill-button";
import { MarkBillPaidButton } from "./mark-bill-paid-button";

export function BillCard({
  bill,
  today,
}: {
  bill: {
    id: string;
    name: string;
    amountMinor: bigint;
    currency: string;
    nextDueDate: Date;
    repeatType: string;
    category: { name: string } | null;
  };
  today: Date;
}) {
  const BillIcon = guessBillIcon(bill.name, bill.category?.name);
  const dueSoon = isDueSoon(bill.nextDueDate, today);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="shrink-0 rounded-full bg-muted p-2">
          <BillIcon className="h-5 w-5 text-primary" />
        </div>
        <p className="font-semibold text-foreground">{bill.name}</p>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${getDueStatusClassName(bill.nextDueDate, today)}`}
        >
          {getDueStatusLabel(bill.nextDueDate, today)}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {bill.category?.name ?? "No category"} · Due{" "}
        {formatDateForDisplay(bill.nextDueDate)} ·{" "}
        {formatRepeatLabel(bill.repeatType)}
      </p>

      <p className="mt-2 text-3xl font-bold text-foreground">
        {formatMoneyFromMinorUnits(bill.amountMinor, bill.currency)}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <MarkBillPaidButton
          billId={bill.id}
          billName={bill.name}
          dueDate={formatDateForInput(bill.nextDueDate)}
          variant={dueSoon ? "due" : "early"}
        />
        <DeleteBillButton billId={bill.id} billName={bill.name} />
      </div>
    </div>
  );
}
