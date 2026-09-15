import { Wallet, TrendingDown, Hourglass, RedoDot } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { computeOverallProgress } from "@/lib/budgets";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { formatMonthLabel } from "@/lib/date";

export function BudgetSummaryCards({
  totalBudgetMinor,
  totalSpentMinor,
  currency,
  monthValue,
}: {
  totalBudgetMinor: bigint;
  totalSpentMinor: bigint;
  currency: string;
  monthValue: string;
}) {
  const { remainingMinor, spentPercent, spentWidth } = computeOverallProgress(
    totalBudgetMinor,
    totalSpentMinor,
  );
  const isOver = remainingMinor < BigInt(0);

  return (
    <div className="mt-2 grid gap-4 md:grid-cols-3">
      <SummaryCard
        label="Spent from budgeted categories"
        value={formatMoneyFromMinorUnits(totalSpentMinor, currency)}
        valueClassName="text-red-600"
        iconClassName="bg-muted text-red-600"
        icon={<TrendingDown className="h-5 w-5" />}
        helper={
          <div>
            <p>
              {spentPercent}% used · {Math.max(0, 100 - spentPercent)}% left
            </p>
            <div className="mt-2">
              <ProgressBar
                widthPercent={spentWidth}
                colorClassName="bg-red-500"
              />
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2 md:contents">
        <SummaryCard
          label={`Total Money for ${formatMonthLabel(monthValue)}`}
          value={formatMoneyFromMinorUnits(totalBudgetMinor, currency)}
          icon={<Wallet className="h-5 w-5" />}
          valueClassName="text-foreground"
        />

        <SummaryCard
          label={isOver ? "Over budget" : "Remaining"}
          value={formatMoneyFromMinorUnits(
            isOver ? -remainingMinor : remainingMinor,
            currency,
          )}
          valueClassName={isOver ? "text-red-600" : "text-emerald-600"}
          iconClassName={
            isOver ? "bg-muted text-red-600" : "bg-muted text-emerald-600"
          }
          icon={
            isOver ? (
              <RedoDot className="h-5 w-5" />
            ) : (
              <Hourglass className="h-5 w-5" />
            )
          }
        />
      </div>
    </div>
  );
}
