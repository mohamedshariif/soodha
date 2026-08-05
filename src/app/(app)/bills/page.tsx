import { archiveBill, markBillAsPaid } from "./actions";
import { AddBillModal } from "./add-bill-modal";
import {
  formatDateForDisplay,
  formatDateForInput,
  getTodayDateInputValue,
  parseDateInputToTransactionDate,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function addDaysUtc(date: Date, days: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
      12,
      0,
      0,
      0
    )
  );
}

function getDaysUntilDue(dueDate: Date, today: Date) {
  return Math.round((dueDate.getTime() - today.getTime()) / millisecondsPerDay);
}

function getDueStatusLabel(dueDate: Date, today: Date) {
  const daysUntilDue = getDaysUntilDue(dueDate, today);

  if (daysUntilDue < 0) {
    return "Overdue";
  }

  if (daysUntilDue === 0) {
    return "Due today";
  }

  if (daysUntilDue === 1) {
    return "Due tomorrow";
  }

  return `Due in ${daysUntilDue} days`;
}

function getDueStatusClassName(dueDate: Date, today: Date) {
  const daysUntilDue = getDaysUntilDue(dueDate, today);

  if (daysUntilDue < 0) {
    return "bg-red-50 text-red-700";
  }

  if (daysUntilDue <= 1) {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

export default async function BillsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const todayInputValue = getTodayDateInputValue();
  const todayDate = parseDateInputToTransactionDate(todayInputValue);
  const attentionEndDate = addDaysUtc(todayDate, 7);

  const [expenseCategories, bills, recentBillPayments] = await Promise.all([
    prisma.category.findMany({
      where: {
        userId: appUser.id,
        type: "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),

    prisma.bill.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        nextDueDate: "asc",
      },
    }),

    prisma.billPayment.findMany({
      where: {
        userId: appUser.id,
      },
      include: {
        bill: true,
        transaction: true,
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 5,
    }),
  ]);

  const billsNeedingAttention = bills.filter((bill) => {
    return bill.nextDueDate.getTime() <= attentionEndDate.getTime();
  });

  const scheduledBills = bills.filter((bill) => {
    return bill.nextDueDate.getTime() > attentionEndDate.getTime();
  });

  const attentionTotalMinor = billsNeedingAttention.reduce((total, bill) => {
    return total + bill.amountMinor;
  }, BigInt(0));

  const scheduledTotalMinor = scheduledBills.reduce((total, bill) => {
    return total + bill.amountMinor;
  }, BigInt(0));

  const recentPaidTotalMinor = recentBillPayments.reduce((total, payment) => {
    return total + payment.amountMinor;
  }, BigInt(0));

  const currency =
    bills[0]?.currency ?? recentBillPayments[0]?.currency ?? "USD";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="mt-2 text-slate-600">
            Track upcoming bills before they become real expenses.
          </p>
        </div>

        <AddBillModal
          expenseCategories={expenseCategories}
          today={todayInputValue}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <BillSummaryCard
          label="Needs attention"
          value={formatMoneyFromMinorUnits(attentionTotalMinor, currency)}
          helper={`${billsNeedingAttention.length} bill${
            billsNeedingAttention.length === 1 ? "" : "s"
          } due soon`}
          valueClassName={
            billsNeedingAttention.length > 0 ? "text-amber-600" : "text-slate-900"
          }
        />

        <BillSummaryCard
          label="Scheduled later"
          value={formatMoneyFromMinorUnits(scheduledTotalMinor, currency)}
          helper={`${scheduledBills.length} scheduled bill${
            scheduledBills.length === 1 ? "" : "s"
          }`}
        />

        <BillSummaryCard
          label="Recently paid"
          value={formatMoneyFromMinorUnits(recentPaidTotalMinor, currency)}
          helper={`${recentBillPayments.length} recent payment${
            recentBillPayments.length === 1 ? "" : "s"
          }`}
          valueClassName="text-emerald-600"
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Bills needing attention
          </h2>
          <p className="text-sm text-slate-500">
            Due within 7 days
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {billsNeedingAttention.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No bills need attention right now.
              </p>
            </div>
          ) : (
            billsNeedingAttention.map((bill) => {
              const dueDate = formatDateForDisplay(bill.nextDueDate);
              const categoryName = bill.category?.name ?? "No category";

              return (
                <div
                  key={bill.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {bill.name}
                        </p>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getDueStatusClassName(
                            bill.nextDueDate,
                            todayDate
                          )}`}
                        >
                          {getDueStatusLabel(bill.nextDueDate, todayDate)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {categoryName} · Due {dueDate} ·{" "}
                        {formatRepeatLabel(bill.repeatType)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatMoneyFromMinorUnits(
                          bill.amountMinor,
                          bill.currency
                        )}
                      </p>

                      <div className="mt-2 flex flex-wrap justify-start gap-3 md:justify-end">
                        <form action={markBillAsPaid}>
                          <input type="hidden" name="billId" value={bill.id} />
                          <input
                            type="hidden"
                            name="dueDate"
                            value={formatDateForInput(bill.nextDueDate)}
                          />
                          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                            Mark as paid
                          </button>
                        </form>

                        <form action={archiveBill}>
                          <input type="hidden" name="billId" value={bill.id} />
                          <button className="text-xs font-medium text-red-600 hover:text-red-700">
                            Delete bill
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Scheduled bills</h2>
          <p className="text-sm text-slate-500">
            Due after 7 days
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {scheduledBills.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No later bills scheduled.
              </p>
            </div>
          ) : (
            scheduledBills.map((bill) => {
              const dueDate = formatDateForDisplay(bill.nextDueDate);
              const categoryName = bill.category?.name ?? "No category";

              return (
                <div
                  key={bill.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {bill.name}
                        </p>

                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          Scheduled
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {categoryName} · Next due {dueDate} ·{" "}
                        {formatRepeatLabel(bill.repeatType)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatMoneyFromMinorUnits(
                          bill.amountMinor,
                          bill.currency
                        )}
                      </p>

                      <form action={archiveBill} className="mt-2">
                        <input type="hidden" name="billId" value={bill.id} />
                        <button className="text-xs font-medium text-red-600 hover:text-red-700">
                          Delete bill
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Recent bill payments
          </h2>
          <p className="text-sm text-slate-500">
            Last {recentBillPayments.length}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {recentBillPayments.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No bill payments recorded yet.
              </p>
            </div>
          ) : (
            recentBillPayments.map((payment) => {
              const paidDate = formatDateForDisplay(
                payment.transaction.transactionDate
              );
              const dueDate = formatDateForDisplay(payment.dueDate);

              return (
                <div
                  key={payment.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {payment.bill.name}
                        </p>

                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          Paid
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Paid {paidDate} · Was due {dueDate}
                      </p>
                    </div>

                    <p className="font-semibold text-emerald-600">
                      {formatMoneyFromMinorUnits(
                        payment.amountMinor,
                        payment.currency
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function BillSummaryCard({
  label,
  value,
  helper,
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function formatRepeatLabel(repeatType: string) {
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