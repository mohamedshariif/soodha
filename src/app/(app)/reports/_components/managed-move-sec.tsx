import { ManagedMovementBarChart } from "@/components/finance-charts";
import { formatMoneyFromMinorUnits } from "@/lib/money";

export function ManagedMovementsSection({
  chartData,
  billPaymentTotalMinor,
  billPaymentCount,
  savingsContributionTotalMinor,
  savingsContributionCount,
  debtPaymentTotalMinor,
  debtPaymentCount,
  currency,
}: {
  chartData: { name: string; amount: number }[];
  billPaymentTotalMinor: bigint;
  billPaymentCount: number;
  savingsContributionTotalMinor: bigint;
  savingsContributionCount: number;
  debtPaymentTotalMinor: bigint;
  debtPaymentCount: number;
  currency: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">Managed money movements</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Bills, savings, and debt activity for this month.
      </p>

      <div className="mt-4 h-64">
        <ManagedMovementBarChart data={chartData} currency={currency} />
      </div>

      <div className="mt-4 grid gap-3">
        <ManagedMovementRow
          label="Bill payments"
          value={formatMoneyFromMinorUnits(billPaymentTotalMinor, currency)}
          helper={`${billPaymentCount} payment${billPaymentCount === 1 ? "" : "s"}`}
        />

        <ManagedMovementRow
          label="Savings contributions"
          value={formatMoneyFromMinorUnits(
            savingsContributionTotalMinor,
            currency,
          )}
          helper={`${savingsContributionCount} contribution${savingsContributionCount === 1 ? "" : "s"}`}
        />

        <ManagedMovementRow
          label="Debt payments"
          value={formatMoneyFromMinorUnits(debtPaymentTotalMinor, currency)}
          helper={`${debtPaymentCount} payment${debtPaymentCount === 1 ? "" : "s"}`}
        />
      </div>
    </section>
  );
}

function ManagedMovementRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-background p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
      </div>
      <p className="text-sm font-semibold text-primary">{value}</p>
    </div>
  );
}
