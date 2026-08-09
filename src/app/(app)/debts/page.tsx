import { archiveDebt } from "./actions";
import { AddDebtModal } from "./add-debt-modal";
import { RecordDebtPaymentModal } from "./record-debt-payment-modal.tsx";
import {
  formatDateForDisplay,
  getTodayDateInputValue,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);
  const oneHundred = BigInt(100);
  const today = getTodayDateInputValue();

  const [debts, recentPayments] = await Promise.all([
    prisma.debt.findMany({
      where: {
        userId: appUser.id,
        status: {
          in: ["ACTIVE", "PAID_OFF"],
        },
        deletedAt: null,
      },
      include: {
        payments: {
          orderBy: {
            paidAt: "desc",
          },
          take: 3,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.debtPayment.findMany({
      where: {
        userId: appUser.id,
      },
      include: {
        debt: true,
        transaction: true,
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 5,
    }),
  ]);

  const activeDebts = debts.filter((debt) => debt.status === "ACTIVE");
  const paidOffDebts = debts.filter((debt) => debt.status === "PAID_OFF");

  const totalOriginalMinor = debts.reduce((total, debt) => {
    return total + debt.originalAmountMinor;
  }, zero);

  const totalRemainingMinor = activeDebts.reduce((total, debt) => {
    return total + debt.remainingAmountMinor;
  }, zero);

  const totalPaidMinor = debts.reduce((total, debt) => {
    return total + (debt.originalAmountMinor - debt.remainingAmountMinor);
  }, zero);

  const minimumPaymentsMinor = activeDebts.reduce((total, debt) => {
    return total + (debt.minimumPaymentMinor ?? zero);
  }, zero);

  const payoffProgressPercent =
    totalOriginalMinor > zero
      ? Number((totalPaidMinor * oneHundred) / totalOriginalMinor)
      : 0;

  const payoffProgressWidth = Math.min(payoffProgressPercent, 100);

  const currency = debts[0]?.currency ?? recentPayments[0]?.currency ?? "USD";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debts</h1>
          <p className="mt-2 text-slate-600">
            Track money you owe and record payments over time.
          </p>
        </div>

        <AddDebtModal />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DebtSummaryCard
          label="Remaining debt"
          value={formatMoneyFromMinorUnits(totalRemainingMinor, currency)}
          helper={`${activeDebts.length} active debt${
            activeDebts.length === 1 ? "" : "s"
          }`}
          valueClassName={
            totalRemainingMinor > zero ? "text-red-600" : "text-slate-900"
          }
        />

        <DebtSummaryCard
          label="Paid so far"
          value={formatMoneyFromMinorUnits(totalPaidMinor, currency)}
          helper={`${payoffProgressPercent}% paid off`}
          valueClassName="text-emerald-600"
        />

        <DebtSummaryCard
          label="Minimum payments"
          value={formatMoneyFromMinorUnits(minimumPaymentsMinor, currency)}
          helper="Monthly minimums for active debts"
          valueClassName={
            minimumPaymentsMinor > zero ? "text-amber-600" : "text-slate-900"
          }
        />
      </div>

      {debts.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-slate-900">
              Overall payoff progress
            </p>
            <p className="font-medium text-slate-900">
              {payoffProgressPercent}%
            </p>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${payoffProgressWidth}%` }}
            />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Active debts</h2>
          <p className="text-sm text-slate-500">
            {activeDebts.length} active
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {activeDebts.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No active debts tracked.
              </p>
            </div>
          ) : (
            activeDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                today={today}
                zero={zero}
                oneHundred={oneHundred}
                canRecordPayment
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Paid off debts</h2>
          <p className="text-sm text-slate-500">
            {paidOffDebts.length} paid off
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {paidOffDebts.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No debts paid off yet.
              </p>
            </div>
          ) : (
            paidOffDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                today={today}
                zero={zero}
                oneHundred={oneHundred}
                canRecordPayment={false}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Recent debt payments
          </h2>
          <p className="text-sm text-slate-500">
            Last {recentPayments.length}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {recentPayments.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No debt payments recorded yet.
              </p>
            </div>
          ) : (
            recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="font-medium text-slate-900">
                      {payment.debt.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Paid {formatDateForDisplay(payment.paidAt)}
                    </p>

                    {payment.note && (
                      <p className="mt-1 text-sm text-slate-500">
                        {payment.note}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-emerald-600">
                    {formatMoneyFromMinorUnits(
                      payment.amountMinor,
                      payment.currency
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function DebtCard({
  debt,
  today,
  zero,
  oneHundred,
  canRecordPayment,
}: {
  debt: {
    id: string;
    name: string;
    lenderName: string | null;
    originalAmountMinor: bigint;
    remainingAmountMinor: bigint;
    currency: string;
    dueDate: Date | null;
    minimumPaymentMinor: bigint | null;
    note: string | null;
    status: string;
    payments: {
      id: string;
      amountMinor: bigint;
      currency: string;
      paidAt: Date;
    }[];
  };
  today: string;
  zero: bigint;
  oneHundred: bigint;
  canRecordPayment: boolean;
}) {
  const paidMinor = debt.originalAmountMinor - debt.remainingAmountMinor;

  const progressPercent =
    debt.originalAmountMinor > zero
      ? Number((paidMinor * oneHundred) / debt.originalAmountMinor)
      : 0;

  const progressWidth = Math.min(progressPercent, 100);

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{debt.name}</p>

            {debt.status === "PAID_OFF" && (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                Paid off
              </span>
            )}
          </div>

          {debt.lenderName && (
            <p className="mt-1 text-sm text-slate-500">
              Lender: {debt.lenderName}
            </p>
          )}

          <p className="mt-1 text-sm text-slate-500">
            {formatMoneyFromMinorUnits(paidMinor, debt.currency)} paid of{" "}
            {formatMoneyFromMinorUnits(debt.originalAmountMinor, debt.currency)}
          </p>

          {debt.dueDate && (
            <p className="mt-1 text-sm text-slate-500">
              Due {formatDateForDisplay(debt.dueDate)}
            </p>
          )}

          {debt.minimumPaymentMinor && (
            <p className="mt-1 text-sm text-slate-500">
              Minimum payment{" "}
              {formatMoneyFromMinorUnits(
                debt.minimumPaymentMinor,
                debt.currency
              )}
            </p>
          )}

          {debt.note && (
            <p className="mt-1 text-sm text-slate-500">{debt.note}</p>
          )}
        </div>

        <div className="text-left md:text-right">
          <p
            className={`font-semibold ${
              debt.remainingAmountMinor > zero
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {debt.remainingAmountMinor > zero ? "Remaining " : "Paid "}
            {formatMoneyFromMinorUnits(
              debt.remainingAmountMinor > zero ? debt.remainingAmountMinor : zero,
              debt.currency
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {progressPercent}% paid
          </p>

          <div className="mt-2 flex flex-wrap justify-start gap-3 md:justify-end">
            {canRecordPayment && (
              <RecordDebtPaymentModal
                debtId={debt.id}
                debtName={debt.name}
                today={today}
              />
            )}

            <form action={archiveDebt}>
              <input type="hidden" name="debtId" value={debt.id} />
              <button className="text-xs font-medium text-red-600 hover:text-red-700">
                Archive debt
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {debt.payments.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500">
            Recent payments
          </p>

          <div className="mt-2 space-y-1">
            {debt.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between text-xs text-slate-500"
              >
                <span>{formatDateForDisplay(payment.paidAt)}</span>
                <span>
                  {formatMoneyFromMinorUnits(
                    payment.amountMinor,
                    payment.currency
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DebtSummaryCard({
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