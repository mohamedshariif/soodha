import { MonthlyCashFlowChart } from "@/components/finance-charts";
import { SectionCard } from "@/components/ui/section-card";
import { formatMonthLabel } from "@/lib/date";

type DailyCashFlowPoint = { day: string; income: number; expenses: number };

export function DailyCashFlowSection({
  data,
  currency,
  monthValue,
  recordCount,
}: {
  data: DailyCashFlowPoint[];
  currency: string;
  monthValue: string;
  recordCount: number;
}) {
  return (
    <SectionCard
      className="mt-6"
      title="Daily income vs expenses"
      description={`Daily cash flow for ${formatMonthLabel(monthValue)}.`}
      meta={`${recordCount} total record${recordCount === 1 ? "" : "s"}`}
    >
      <div className="mt-5 h-80">
        <MonthlyCashFlowChart data={data} currency={currency} />
      </div>
    </SectionCard>
  );
}