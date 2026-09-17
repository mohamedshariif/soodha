import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { guessBillIcon } from "@/lib/icons/bill-icon-suggest";
import { Check, Clock } from "lucide-react";

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
    <section>
      {payments.length === 0 ? (
        <div className="mt-4 rounded-lg bg-muted p-4">
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-muted-foreground"/>
            <p className="text-sm text-muted-foreground">
              No bill payments recorded yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {payments.map((payment) => {
            const PaymentIcon = guessBillIcon(
              payment.bill.name,
              payment.bill.category?.name,
            );

            return (
              <div
                key={payment.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 rounded-full bg-muted p-2">
                      <PaymentIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {payment.bill.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Was due{" "}{formatDateForDisplay(payment.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                    <Check className="w-4 h-4 text-primary"/>
                    <span className="text-xs font-medium text-emerald-700">
                      Paid
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-3xl font-bold text-primary">
                  {formatMoneyFromMinorUnits(
                    payment.amountMinor,
                    payment.currency,
                  )}
                </p>

                  <p className="mt-2 text-md text-muted-foreground">
                    Paid on{" "}
                    {formatDateForDisplay(payment.transaction.transactionDate)}
                  </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
