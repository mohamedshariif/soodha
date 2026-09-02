import { formatMoneyFromMinorUnits } from "@/lib/money";
import { computeSavingsTotals } from "@/lib/savings";
import { ProgressBar } from "./progress-bar";
import { SummaryCard } from "@/components/ui/summary-card";
import { TargetIcon, HandCoins } from "lucide-react";

export function SavingsSummaryCards({
  goals,
  currency,
}: {
  goals: {
    targetAmountMinor: bigint;
    currentAmountMinor: bigint;
    status: string;
  }[];
  currency: string;
}) {
  const {
    totalTargetMinor,
    totalSavedMinor,
    totalRemainingMinor,
    overallProgressPercent,
  } = computeSavingsTotals(goals);
  const activeCount = goals.filter((g) => g.status === "ACTIVE").length;

  return (
    <>
      <div className="mt-2 grid gap-4 md:grid-cols-3">
        <div className="bg-card p-5 rounded-xl border border-border transition-all hover:-translate-y-1 duration-300 ease-out hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-md">Saved so far</p>
              <p className="mt-2 text-2xl font-bold text-primary">
                {formatMoneyFromMinorUnits(totalSavedMinor, currency)}
              </p>
            </div>
            <div className="flex self-start bg-muted p-2 rounded-lg">
              <HandCoins className="w-5 h-5 text-primary" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex-1">
              <ProgressBar
                widthPercent={Math.min(overallProgressPercent, 100)}
              />
            </div>
            <span className="text-sm ml-2 text-primary font-semibold">
              {overallProgressPercent}%
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:contents">
          <SummaryCard
            label="Target total"
            value={formatMoneyFromMinorUnits(totalTargetMinor, currency)}
            helper={`${goals.length} goals${goals.length === 1 ? "" : "s"} tracked`}
            icon={<TargetIcon className="w-5 h-5" />}
            valueClassName="text-foreground"
          />
          <SummaryCard
            label="Remaining"
            value={formatMoneyFromMinorUnits(totalRemainingMinor, currency)}
            helper={`${activeCount} active goals${activeCount === 1 ? "" : "s"}`}
            icon={<TargetIcon className="w-5 h-5" />}
            valueClassName={
              totalRemainingMinor > BigInt(0)
                ? "text-amber-600"
                : "text-slate-900"
            }
          />
        </div>
      </div>
    </>
  );
}
