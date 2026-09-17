import { BudgetCard } from "./budget-card";

export function BudgetList({
  monthLabel,
  rows,
}: {
  monthLabel: string;
  rows: {
    budget: Parameters<typeof BudgetCard>[0]["budget"];
    spentMinor: bigint;
    transactions: Parameters<typeof BudgetCard>[0]["transactions"];
  }[];
}) {
  return (
    <section className="mt-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{monthLabel} budgets</h2>
        <p className="text-sm text-muted-foreground">
          {rows.length} budget{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No budgets yet for this month.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {rows.map(({ budget, spentMinor, transactions }) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spentMinor={spentMinor}
              transactions={transactions}
            />
          ))}
        </div>
      )}
    </section>
  );
}
