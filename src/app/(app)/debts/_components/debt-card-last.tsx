"use client";

import { useState } from "react";
import { ChevronDown, CheckCircle2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { archiveDebt } from "./actions";
import { RecordDebtPaymentModal } from "./record-debt-payment-modal";
import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import type { DebtDirection } from "@/generated/prisma";

type DebtCardProps = {
  debt: {
    id: string;
    name: string;
    lenderName: string | null;
    direction: DebtDirection;
    originalAmountMinor: bigint;
    remainingAmountMinor: bigint;
    currency: string;
    dueDate: Date | null;
    status: string;
    payments: { id: string; amountMinor: bigint; currency: string; paidAt: Date }[];
  };
  today: string;
  canRecordPayment: boolean;
};

export function DebtCard({ debt, today, canRecordPayment }: DebtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const zero = 0n;
  const oneHundred = 100n;

  const isPayable = debt.direction === "I_OWE";
  const isCompleted = debt.status === "PAID_OFF";
  const paidMinor = debt.originalAmountMinor - debt.remainingAmountMinor;
  const progressPercent =
    debt.originalAmountMinor > zero
      ? Number((paidMinor * oneHundred) / debt.originalAmountMinor)
      : 0;
  const progressWidth = Math.min(progressPercent, 100);

  const isOverdue =
    !isCompleted && debt.dueDate !== null && new Date(debt.dueDate) < new Date(today);
  const isNearPayoff = !isCompleted && progressPercent >= 80;

  // bar/badge color: completed > overdue > near payoff > default direction color
  const barColorClass = isCompleted
    ? "bg-success"
    : isOverdue
      ? "bg-danger"
      : isNearPayoff
        ? "bg-success"
        : isPayable
          ? "bg-primary"
          : "bg-secondary";

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-8 w-8 flex-none items-center justify-center rounded-full ${
              isPayable ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
            }`}
          >
            {isPayable ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownLeft className="h-4 w-4" />
            )}
          </span>
          <div>
            <p className="font-medium text-foreground">{debt.name}</p>
            {debt.lenderName && (
              <p className="text-sm text-muted-foreground">
                {isPayable ? "Lender" : "From"}: {debt.lenderName}
              </p>
            )}
          </div>
        </div>

        {isCompleted && (
          <span className="flex flex-none items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </span>
        )}
        {!isCompleted && isOverdue && (
          <span className="flex-none rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
            Overdue
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{debt.dueDate ? formatDateForDisplay(debt.dueDate) : "No date set"}</span>
        <span className="font-medium text-foreground">{progressPercent}%</span>
      </div>

      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${barColorClass}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {formatMoneyFromMinorUnits(paidMinor, debt.currency)} of{" "}
          {formatMoneyFromMinorUnits(debt.originalAmountMinor, debt.currency)}
        </p>

        <div className="flex items-center gap-3">
          {canRecordPayment && (
            <RecordDebtPaymentModal
              debtId={debt.id}
              debtName={debt.name}
              direction={debt.direction}
              today={today}
            />
          )}
          <form action={archiveDebt}>
            <input type="hidden" name="debtId" value={debt.id} />
            <button className="text-xs font-medium text-muted-foreground transition-colors hover:text-danger">
              Archive
            </button>
          </form>
        </div>
      </div>

      {debt.payments.length > 0 && (
        <div className="mt-3 border-t border-border-subtle pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded((open) => !open)}
            className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span>Recent {isPayable ? "payments" : "collections"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1">
              {debt.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDateForDisplay(payment.paidAt)}</span>
                  <span>{formatMoneyFromMinorUnits(payment.amountMinor, payment.currency)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
