import { SavingsGoalCard } from "./savings-goal-card";

export function SavingsGoalList({
  title,
  goals,
  today,
  canContribute,
  emptyText,
}: {
  title: string;
  goals: Parameters<typeof SavingsGoalCard>[0]["goal"][];
  today: string;
  canContribute: boolean;
  emptyText: string;
}) {
  return (
    <section className="mt-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {goals.length} {canContribute ? "active" : "completed"}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        {goals.length === 0 ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
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
