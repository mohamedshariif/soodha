import { ExpenseCategoryDonutChart } from "@/components/finance-charts";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMoneyFromMinorUnits } from "@/lib/money";

type TopCategory = { name: string; amountMinor: bigint; count: number };

export function ExpenseCategoriesSection({
  categories,
  chartData,
  currency,
}: {
  categories: TopCategory[];
  chartData: { name: string; amount: number }[];
  currency: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">
          Top expense categories
        </h2>
        <p className="text-sm text-muted-foreground">Top {categories.length}</p>
      </div>

      <div className="mt-4 h-72">
        <ExpenseCategoryDonutChart data={chartData} currency={currency} />
      </div>

      <div className="mt-4 space-y-3">
        {categories.length === 0 ? (
          <EmptyState description="No expenses recorded for this month." />
        ) : (
          categories.map((category) => (
            <div
              key={category.name}
              className="flex items-center justify-between gap-4 rounded-lg bg-background p-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {category.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.count} record{category.count === 1 ? "" : "s"}
                </p>
              </div>

              <p className="text-sm font-semibold text-primary">
                {formatMoneyFromMinorUnits(category.amountMinor, currency)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
