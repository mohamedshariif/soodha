"use client";

import { useState } from "react";
import { SavingsGoalList } from "./savings-goal-list";
import type { SavingsGoalCard } from "./savings-goal-card";

type Goal = Parameters<typeof SavingsGoalCard>[0]["goal"];

export function SavingsGoalTabs({
  activeGoals,
  completedGoals,
  today,
}: {
  activeGoals: Goal[];
  completedGoals: Goal[];
  today: string;
}) {
  const [tab, setTab] = useState<"active" | "completed">("active");

  const tabs = [
    { key: "active" as const, label: "Active", count: activeGoals.length },
    {
      key: "completed" as const,
      label: "Completed",
      count: completedGoals.length,
    },
  ];

  return (
    <div className="mt-6">
      <div className="inline-flex rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "active" ? (
        <SavingsGoalList
          title="Active goals"
          goals={activeGoals}
          today={today}
          canContribute
          emptyText="No active savings goals yet."
        />
      ) : (
        <SavingsGoalList
          title="Compeleted goals"
          goals={completedGoals}
          today={today}
          canContribute={false}
          emptyText="No completed goals yet."
        />
      )}
    </div>
  );
}
