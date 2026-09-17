import { createElement } from "react";
import { formatDateForDisplay, formatDateForInput } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import {
  getDueStatusLabel,
  getDueStatusClassName,
  formatRepeatLabel,
  isDueSoon,
} from "@/lib/bills";
import { guessBillIcon } from "@/lib/icons/bill-icon-suggest";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { archiveBill } from "../actions";
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
  const dueSoon = isDueSoon(bill.nextDueDate, today);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="shrink-0 rounded-xl bg-muted p-2">
          {createElement(guessBillIcon(bill.name, bill.category?.name), {
            className: "h-5 w-5 text-primary",
          })}
        </div>
        <div>
          <p className="font-semibold text-foreground">{bill.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Due Date:{" "}{formatDateForDisplay(bill.nextDueDate)}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium self-start ${getDueStatusClassName(bill.nextDueDate, today)}`}
        >
          {getDueStatusLabel(bill.nextDueDate, today)}
        </span>
      </div>

      <div className="flex mt-2">
        <p className="text-3xl font-bold text-foreground">
          {formatMoneyFromMinorUnits(bill.amountMinor, bill.currency)}
        </p>
        <p className="self-end text-sm text-muted-foreground">
          {"/ "}{formatRepeatLabel(bill.repeatType)}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <MarkBillPaidButton
          billId={bill.id}
          billName={bill.name}
          dueDate={formatDateForInput(bill.nextDueDate)}
          variant={dueSoon ? "due" : "early"}
        />
        <DeleteActionButton
          action={archiveBill}
          actionData={{ billId: bill.id }}
          itemName={bill.name}
          description="If this bill has payment history, it will be archived instead of permanently deleted."
          successTitle="Bill removed"
          errorTitle="Couldn't delete bill"
          className="shrink-0 rounded-full bg-muted p-3 text-red-500 transition hover:bg-muted/50"
        />
      </div>
    </div>
  );
}
