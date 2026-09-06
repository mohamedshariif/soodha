import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { guessBillIcon } from "@/lib/icons/bill-icon-suggest";

export function PaidBillsList({
  payments,
}: {
  payments: {
    id: string;
    amountMinor: bigint;
    currency: string;
    dueDate: Date;
    transaction: { transactionDate: Date };
    bill: { name: string; category: { name: string } | null };
  }[];
}) {
  return (
    <section className="">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Paid bills</h2>
        <p className="text-sm text-muted-foreground">{payments.length} recorded</p>
      </div>

      {payments.length === 0 ? (
        <div className="mt-4 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">No bill payments recorded yet.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => {
            const PaymentIcon = guessBillIcon(payment.bill.name, payment.bill.category?.name);

            return (
              <div key={payment.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="shrink-0 rounded-full bg-muted p-2">
                    <PaymentIcon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{payment.bill.name}</p>
                  <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Paid
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {payment.bill.category?.name ?? "No category"} · Was due {formatDateForDisplay(payment.dueDate)}
                </p>

                <p className="mt-2 text-3xl font-bold text-foreground">
                  {formatMoneyFromMinorUnits(payment.amountMinor, payment.currency)}
                </p>

                <p className="mt-4 text-sm text-muted-foreground">
                  Paid on {formatDateForDisplay(payment.transaction.transactionDate)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}