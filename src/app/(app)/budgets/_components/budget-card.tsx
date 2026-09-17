"use client";

import { createElement, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { computeBudgetProgress } from "@/lib/budgets";
import { getCategoryIcon } from "@/lib/icons/category-icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { deleteBudget } from "../actions";

type TransactionSummary = {
  id: string;
  amountMinor: bigint;
  transactionDate: Date;
  description: string | null;
};

export function BudgetCard({
  budget,
  spentMinor,
  transactions,
}: {
  budget: {
    id: string;
    limitAmountMinor: bigint;
    currency: string;
    alertThresholdPercent: number;
    category: { name: string; icon: string | null } | null;
  };
  spentMinor: bigint;
  transactions: TransactionSummary[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryName = budget.category?.name ?? "Deleted category";

  const { remainingMinor, progressPercent, progressWidth, statusText, statusClassName, progressBarClassName } =
    computeBudgetProgress(budget.limitAmountMinor, spentMinor, budget.alertThresholdPercent);

  const isOver = remainingMinor < BigInt(0);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-muted p-2">
            {createElement(getCategoryIcon(budget.category?.icon), {
              className: "h-5 w-5 text-primary",
            })}
          </div>
          <div className="self-center">
            <p className="font-medium text-lg text-foreground">{categoryName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${statusClassName}`}>
              {budget.alertThresholdPercent}% {statusText}
            </span>
          </div>
          <DeleteActionButton
            action={deleteBudget}
            actionData={{ budgetId: budget.id }}
            itemName={`${categoryName} budget`}
            description="This budget limit will be permanently removed. Your transactions won't be affected."
            successTitle="Budget deleted"
            errorTitle="Couldn't delete budget"
          />
        </div>
      </div>
      <div className="flex items-center justify-between font-semibold text-lg mt-3">
        <p className="text-primary">
          {formatMoneyFromMinorUnits(spentMinor, budget.currency)}
        </p>
        <p>
          {formatMoneyFromMinorUnits(budget.limitAmountMinor, budget.currency)}
        </p>
      </div>

      <div className="mt-2">
        <ProgressBar widthPercent={progressWidth} colorClassName={progressBarClassName} />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="mt-1 text-muted-foreground text-xs">
          {progressPercent}% Used
        </span>
        <p className={`text-sm font-semibold ${isOver ? "text-red-600" : "text-emerald-600"}`}>
          {isOver ? "Over " : ""}{formatMoneyFromMinorUnits(isOver ? -remainingMinor : remainingMinor, budget.currency)}
          {!isOver && " Left"}
        </p>
      </div>
      </div>


      <div className="flex items-center justify-between border-t border-border-subtle py-2 px-4 bg-muted/90">
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer py-2"
        >
          <div className="flex items-center gap-1">
            {transactions.length} transaction{transactions.length === 1 ? "" : "s"} this month
          </div>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-1 bg-muted/90 px-3 pb-3">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet this month.</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-card flex items-center justify-between text-sm px-3 py-2 rounded-lg shadow-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground text-sm">{transaction.description ?? "Transaction"}</p>
                  <p className="text-xs text-muted-foreground">{formatDateForDisplay(transaction.transactionDate)}</p>
                </div>
                <p className="shrink-0 font-medium text-red-600">
                  -{formatMoneyFromMinorUnits(transaction.amountMinor, budget.currency)}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
