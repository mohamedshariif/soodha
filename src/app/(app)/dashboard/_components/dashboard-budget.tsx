import { createElement } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { getCategoryIcon } from "@/lib/icons/category-icons";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { PieChart } from "lucide-react";

type BudgetProgress = {
  id: string;
  name: string;
  icon: string | null;
  spentMinor: bigint;
  limitMinor: bigint;
  currency: string;
  progressWidth: number;
  progressBarClassName: string;
};

export function DashboardBudget({
  budgets,
  monthValue,
}: {
  budgets: BudgetProgress[];
  monthValue: string;
}) {
  return (
    <SectionCard
      title="Budget progress"
      description="What you have spent against each monthly limit."
      action={
        <Link
          href={`/budgets?month=${monthValue}`}
          className="font-medium text-primary hover:text-primary-hover"
        >
          View budgets
        </Link>
      }
    >
      {budgets.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-lg bg-muted/40 p-4">
          <PieChart className="w-5 h-5 text-muted-foreground"/>
          <p className="mt-5 text-sm text-muted-foreground">
            No budgets set for this month.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                  {createElement(getCategoryIcon(budget.icon), {
                    className: "h-4 w-4",
                  })}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {budget.name}
                </p>
                <p className="shrink-0 text-sm font-semibold text-foreground">
                  {formatMoneyFromMinorUnits(
                    budget.spentMinor,
                    budget.currency,
                  )}{" "}
                  /{" "}
                  {formatMoneyFromMinorUnits(
                    budget.limitMinor,
                    budget.currency,
                  )}
                </p>
              </div>
              <div className="mt-2">
                <ProgressBar
                  widthPercent={budget.progressWidth}
                  colorClassName={budget.progressBarClassName}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
