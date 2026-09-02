import { formatMoneyFromMinorUnits } from "@/lib/money";
import { formatDateForDisplay } from "@/lib/date";
import { computeGoalProgress } from "@/lib/savings";
import { AddSavingsContributionModal } from "../add-savings-contribution-modal";
import { ProgressBar } from "./progress-bar";
import { guessSavingsGoalIcon } from "@/lib/icons/savings-goal-icon-suggests";
import { DeleteGoalButton } from "./delete-goal-button";

export function SavingsGoalCard({
  goal,
  today,
  canContribute,
}: {
  goal: {
    id: string;
    name: string;
    targetAmountMinor: bigint;
    currentAmountMinor: bigint;
    currency: string;
    deadline: Date | null;
    note: string | null;
    status: string;
    contributions: { 
      id: string; 
      amountMinor: bigint; 
      currency: string; 
      contributionDate: Date 
    }[];
  };
  today: string;
  canContribute: boolean;
}) {
  const { remainingMinor, progressPercent, progressWidth } = computeGoalProgress(goal);
  const zero = BigInt(0);
  const GoalIcon = guessSavingsGoalIcon(goal.name);

  return (
    <div className="rounded-lg bg-card p-4 border border-border hover:shadow-md duration-300">
      <div>
        <div>

          <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-muted p-3 rounded-xl">
              <GoalIcon className="h-6 w-6 text-primary"/>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">  
                <p className="text-foreground text-xl font-semibold capitalize">
                  {goal.name}
                </p>
                {goal.status === "COMPLETED" && (
                  <span className="rounded-full bg-muted text-primary px-2 py-1 text-xs font-medium">
                    Completed
                  </span>
                )}
              </div>
              {goal.deadline && (
                <p className="text-muted-foreground text-sm">
                  Deadline: {formatDateForDisplay(goal.deadline)}
                </p>
              )}
            </div>
          </div>
            <DeleteGoalButton goalId={goal.id} goalName={goal.name}/>
          </div>

          <div>
            {goal.note && (
              <p className="text-foreground">
                {goal.note}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-primary">
              {formatMoneyFromMinorUnits(goal.currentAmountMinor, goal.currency)}
            </p>
            <p className={`font-semibold ${remainingMinor > zero ? "text-amber-600" : "text-primary"}`}>
              {/* {remainingMinor > zero ? "Remaining " : "Reached "} */}
              {formatMoneyFromMinorUnits(remainingMinor > zero ? remainingMinor : zero, goal.currency)}
            </p>
          </div>
        </div>

        <div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progress</span>
              <p className="text-primary font-semibold text-sm">
                {progressPercent}%
              </p>
            </div>
            <ProgressBar widthPercent={progressWidth}/>
          </div>

        </div>

        {canContribute && (
              <AddSavingsContributionModal 
                savingsGoalId={goal.id}
                savingsGoalName={goal.name}
                today={today}
              />
            )}

      </div>
    </div>
  );
}
