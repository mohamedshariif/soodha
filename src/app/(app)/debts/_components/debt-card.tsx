"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { removeDebt } from "../actions";
import { RecordDebtPaymentModal } from "./record-debt-payment-modal";
import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import type { DebtDirection } from "@/generated/prisma/enums";
import { DeleteActionButton } from "@/components/ui/delete-action-button";

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
  canRecordPayment: boolean;
};

export function DebtCard({ debt, today, canRecordPayment }: DebtCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const zero = 0n;
  const oneHundred = 100n;

  const isPayable = debt.direction === "I_OWE";

  const paidMinor = debt.originalAmountMinor - debt.remainingAmountMinor;

  const progressPercent =
    debt.originalAmountMinor > zero
      ? Number((paidMinor * oneHundred) / debt.originalAmountMinor)
      : 0;

  const progressWidth = Math.min(progressPercent, 100);

  const isPaidOff = debt.remainingAmountMinor <= zero;
  const directionLabel = isPayable ? "I Owe" : "Owed to Me";
  const DirectionIcon = isPayable ? ArrowUpRight : ArrowDownLeft;
  const progressLabel = isPayable ? "Paid" : "collected";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isPayable
                  ? "bg-red-200 dark:bg-danger/20 text-red-500 dark:text-red-600"
                  : "bg-primary/10 dark:bg-primary/20 text-primary"
                }`}
            >
              <DirectionIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-semibold text-foreground">
                  {debt.name}
                </h3>

                {isPaidOff && (
                  <span className="shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    {isPayable ? "Paid off" : "Collected"}
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                {directionLabel}
                {debt.lenderName && ` · ${debt.lenderName}`}
              </p>
            </div>
          </div>

          <DeleteActionButton
            action={removeDebt}
            actionData={{ debtId: debt.id }}
            itemName={debt.name}
            description="If this debt has payment history, it will be archived instead of permanently deleted."
            successTitle="Debt removed"
            errorTitle="Couldn't remove debt"
            className="shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-red-500"
          />
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground">
            {isPaidOff
              ? isPayable
                ? "Total paid"
                : "Total collected"
              : "Remaining"}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${isPaidOff
                ? "text-success"
                : isPayable
                  ? "text-foreground"
                  : "text-primary"
              }`}
          >
            {formatMoneyFromMinorUnits(
              isPaidOff ? zero : debt.remainingAmountMinor,
              debt.currency,
            )}
          </p>
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatMoneyFromMinorUnits(
                paidMinor,
                debt.currency,
              )}{" "}
              {progressLabel} of{" "}
              {formatMoneyFromMinorUnits(
                debt.originalAmountMinor,
                debt.currency,
              )}
            </span>

            <span className="font-semibold text-foreground">
              {progressPercent}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${isPayable
                  ? "bg-red-500"
                  : "bg-emerald-500"
                }`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {debt.dueDate && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />

              <span>
                {isPayable ? "Due" : "Expected"}{" "}
                {formatDateForDisplay(debt.dueDate)}
              </span>
            </div>
          )}

          {debt.minimumPaymentMinor !== null && (
            <span>
              Min. payment{" "}
              {formatMoneyFromMinorUnits(
                debt.minimumPaymentMinor,
                debt.currency,
              )}
            </span>
          )}
        </div>

        {debt.note && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {debt.note}
          </p>
        )}

        {canRecordPayment && !isPaidOff && (
          <div className="mt-5">
            <RecordDebtPaymentModal
              debtId={debt.id}
              debtName={debt.name}
              direction={debt.direction}
              today={today}
              className={
                isPayable
                  ? "bg-green-700 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }
            />
          </div>
        )}
      </div>

      {debt.payments.length > 0 && (
        <div className="border-t border-border">
          <button
            type="button"
            onClick={() => setIsExpanded((open) => !open)}
            className="flex w-full items-center justify-between px-5 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <span>
              {debt.payments.length}{" "}
              {isPayable ? "payment" : "collection"}
              {debt.payments.length !== 1 ? "s" : ""}
            </span>

            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""
                }`}
            />
          </button>

          {isExpanded && (
            <div className="space-y-2 border-t border-border bg-muted/20 px-5 py-3">
              {debt.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    {formatDateForDisplay(payment.paidAt)}
                  </span>

                  <span className="font-medium text-foreground">
                    {formatMoneyFromMinorUnits(
                      payment.amountMinor,
                      payment.currency,
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
