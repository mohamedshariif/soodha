import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { HandCoins } from "lucide-react";

export function DashboardSavings({
  totalTargetMinor,
  totalSavedMinor,
  overallProgressPercent,
  currency,
}: {
  totalTargetMinor: bigint;
  totalSavedMinor: bigint;
  overallProgressPercent: number;
  currency: string;
}) {
  const hasGoals = totalTargetMinor > BigInt(0);

  return (
    <SectionCard
      title="Total Savings goals"
      action={
        <Link
          href="/savings"
          className="font-medium text-primary hover:text-primary-hover"
        >
          View Savings
        </Link>
      }
    >
      {!hasGoals ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-lg bg-muted/60 p-4">
          <HandCoins className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No savings goals</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-primary">
                {formatMoneyFromMinorUnits(totalSavedMinor, currency)}
              </p>
              <p className="text-sm text-muted-foreground">Saved so far</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {formatMoneyFromMinorUnits(totalTargetMinor, currency)}
              </p>
              <p className="text-sm text-muted-foreground">Target amount</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <ProgressBar widthPercent={overallProgressPercent} />
            <span className="text-primary text-sm font-semibold">
              {overallProgressPercent}% COMPLETE
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
