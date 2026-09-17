import { TrendingUp, TrendingDown, Scale, Wallet } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { formatMoneyFromMinorUnits } from "@/lib/money";

export function ReportSummaryCards({
  incomeTotalMinor,
  incomeCount,
  expenseTotalMinor,
  expenseCount,
  netAfterExpensesMinor,
  availableCashChangeMinor,
  currency,
}: {
  incomeTotalMinor: bigint;
  incomeCount: number;
  expenseTotalMinor: bigint;
  expenseCount: number;
  netAfterExpensesMinor: bigint;
  availableCashChangeMinor: bigint;
  currency: string;
}) {
  const netIsPositive = netAfterExpensesMinor >= BigInt(0);
  const cashChangeIsPositive = availableCashChangeMinor >= BigInt(0);

  return (
    <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      <div className="grid grid-cols-2 gap-2 md:contents">
        <SummaryCard
          label="Income"
          value={formatMoneyFromMinorUnits(incomeTotalMinor, currency)}
          helper={`${incomeCount} income record${incomeCount === 1 ? "" : "s"}`}
          valueClassName="text-emerald-600"
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-muted text-primary"
        />

        <SummaryCard
          label="Expenses"
          value={formatMoneyFromMinorUnits(expenseTotalMinor, currency)}
          helper={`${expenseCount} expense record${expenseCount === 1 ? "" : "s"}`}
          valueClassName="text-red-600"
          icon={<TrendingDown className="h-5 w-5" />}
          iconClassName="bg-muted text-red-600"
        />
      </div>

      <SummaryCard
        label="Net after expenses"
        value={formatMoneyFromMinorUnits(netAfterExpensesMinor, currency)}
        helper="Income - expenses"
        valueClassName={netIsPositive ? "text-primary" : "text-red-600"}
        icon={<Scale className="h-5 w-5" />}
        iconClassName={
          netIsPositive ? "bg-muted text-emerald-600" : "bg-muted text-red-600"
        }
      />

      <SummaryCard
        label="Available cash change"
        value={formatMoneyFromMinorUnits(availableCashChangeMinor, currency)}
        helper="Income - expenses - savings"
        valueClassName={
          cashChangeIsPositive ? "text-emerald-600" : "text-red-600"
        }
        icon={<Wallet className="h-5 w-5" />}
        iconClassName={
          cashChangeIsPositive
            ? "bg-muted text-primary"
            : "bg-muted text-red-600"
        }
      />
    </div>
  );
}
