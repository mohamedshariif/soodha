import { createElement } from "react";
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { DashboardIncomeExpenseChart } from "@/components/finance-charts";
import { SectionCard } from "@/components/ui/section-card";
import { formatDateForDisplay } from "@/lib/date";
import { getCategoryIcon } from "@/lib/icons/category-icons";
import { formatMoneyFromMinorUnits } from "@/lib/money";

type RecentTransaction = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amountMinor: bigint;
  currency: string;
  transactionDate: Date;
  description: string | null;
  category: { name: string; icon: string | null } | null;
  account: { name: string };
};

type ChartPoint = { week: string; income: number; expense: number };

export function DashboardActivity({
  currency,
  chartData,
  recentTransactions,
}: {
  currency: string;
  chartData: ChartPoint[];
  recentTransactions: RecentTransaction[];
}) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-5">
      <SectionCard
        className="lg:col-span-3"
        title="Income vs expenses"
        description="Your cash movement across the selected month."
      >
        <div className="mt-5 h-72">
          <DashboardIncomeExpenseChart data={chartData} currency={currency} />
        </div>
      </SectionCard>

      <SectionCard
        className="lg:col-span-2"
        title="Recent activity"
        description="Your latest five transactions."
        action={
          <Link
            href="/transactions"
            className="font-medium text-primary hover:text-primary-hover"
          >
            View all
          </Link>
        }
      >
        <div className="mt-4 divide-y divide-border-subtle">
          {recentTransactions.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "INCOME";
              const isExpense = transaction.type === "EXPENSE";
              const TransactionIcon = isIncome
                ? ArrowUpRight
                : isExpense
                  ? ArrowDownLeft
                  : ArrowRightLeft;
              const amountClassName = isIncome
                ? "text-emerald-600"
                : isExpense
                  ? "text-red-600"
                  : "text-primary";
              const iconClassName = isIncome
                ? "bg-muted/80 text-emerald-600"
                : isExpense
                  ? "bg-muted/80 text-red-600"
                  : "bg-muted text-primary";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
                  >
                    {transaction.category ? (
                      createElement(
                        getCategoryIcon(transaction.category.icon),
                        { className: "h-4 w-4" },
                      )
                    ) : (
                      <TransactionIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {transaction.description ??
                        transaction.category?.name ??
                        "Transaction"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {transaction.account.name} ·{" "}
                      {formatDateForDisplay(transaction.transactionDate)}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-sm font-semibold ${amountClassName}`}
                  >
                    {isIncome ? "+" : isExpense ? "-" : ""}
                    {formatMoneyFromMinorUnits(
                      transaction.amountMinor,
                      transaction.currency,
                    )}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}
