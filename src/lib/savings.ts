const ZERO = BigInt(0);
const ONE_HUNDRED = BigInt(100);

export function computeSavingsTotals(
  goals: { targetAmountMinor: bigint; currentAmountMinor: bigint } []
) {
  const totalTargetMinor = goals.reduce((t, g) => t + g.targetAmountMinor, ZERO);
  const totalSavedMinor = goals.reduce((t, g) => t + g.currentAmountMinor, ZERO);

  const totalRemainingMinor = goals.reduce((t, g) => {
    const remaining = g.targetAmountMinor - g.currentAmountMinor;
    return t + (remaining > ZERO ? remaining : ZERO);
  }, ZERO);

  const overallProgressPercent =
    totalTargetMinor > ZERO
      ? Number((totalSavedMinor * ONE_HUNDRED) / totalTargetMinor)
      : 0;
  
  return { 
    totalTargetMinor, 
    totalSavedMinor, 
    totalRemainingMinor, 
    overallProgressPercent 
  };
}

export function computeGoalProgress(goal: {
  targetAmountMinor: bigint;
  currentAmountMinor: bigint;
}) {
  const remainingMinor = goal.targetAmountMinor - goal.currentAmountMinor;
  const progressPercent =
    goal.targetAmountMinor > ZERO
      ? Number((goal.currentAmountMinor * ONE_HUNDRED) / goal.targetAmountMinor)
      : 0;
    
  return { 
    remainingMinor, 
    progressPercent, 
    progressWidth: Math.min(progressPercent, 100)
  };
}