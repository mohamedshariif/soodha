import { SavingsGoalCard } from "./savings-goal-card";
import { ReactNode } from "react";

export function SavingsGoalList({
  goals,
  today,
  canContribute,
  emptyIcon,
  emptyText,
}: {
  goals: Parameters<typeof SavingsGoalCard>[0]["goal"][];
  today: string;
  canContribute: boolean;
  emptyIcon: ReactNode;
  emptyText: string;
}) {
  return (
    <section className="mt-3">
      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg bg-muted p-4">
            <span>{emptyIcon}</span>
            <p className="mt-1 text-sm text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              today={today}
              canContribute={canContribute}
            />
          ))
        )}
      </div>
    </section>
  );
}
