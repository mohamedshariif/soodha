const ZERO = BigInt(0);
const ONE_HUNDRED = BigInt(100);

export const ALERT_THRESHOLD_PRESETS = [50, 75, 90] as const;

export function computeBudgetProgress(
  limitAmountMinor: bigint,
  spentMinor: bigint,
  alertThresholdPercent: number,
) {
  const remainingMinor = limitAmountMinor - spentMinor;
  const progressPercent =
    limitAmountMinor > ZERO
      ? Number((spentMinor * ONE_HUNDRED) / limitAmountMinor)
      : 0;
  const progressWidth = Math.min(progressPercent, 100);

  const isOverBudget = progressPercent >= 100;
  const isNearLimit = !isOverBudget && progressPercent >= alertThresholdPercent;

  const statusText = isOverBudget
    ? "Over budget"
    : isNearLimit
      ? "Near limit"
      : "On track";
  const statusClassName = isOverBudget
    ? "bg-red-50 text-red-700"
    : isNearLimit
      ? "bg-amber-50 text-amber-700"
      : "bg-emerald-50 text-emerald-700";
  const progressBarClassName = isOverBudget
    ? "bg-red-600"
    : isNearLimit
      ? "bg-amber-500"
      : "bg-emerald-600";

  return {
    remainingMinor,
    progressPercent,
    progressWidth,
    statusText,
    statusClassName,
    progressBarClassName,
  };
}

export function computeOverallProgress(
  totalBudgetMinor: bigint,
  totalSpentMinor: bigint,
) {
  const remainingMinor = totalBudgetMinor - totalSpentMinor;
  const spentPercent =
    totalBudgetMinor > ZERO
      ? Number((totalSpentMinor * ONE_HUNDRED) / totalBudgetMinor)
      : 0;
  return {
    remainingMinor,
    spentPercent,
    spentWidth: Math.min(spentPercent, 100),
  };
}
