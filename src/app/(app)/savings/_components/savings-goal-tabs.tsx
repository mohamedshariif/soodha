"use client";

import { useState } from "react";
import { SavingsGoalList } from "./savings-goal-list";
import type { SavingsGoalCard } from "./savings-goal-card";
import { HandCoins, CircleCheckBig } from "lucide-react";

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
      <div className="inline-flex rounded-lg bg-muted p-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-card text-foreground rounded-xl shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} {t.count} 
          </button>
        ))}
      </div>

      {tab === "active" ? (
        <SavingsGoalList
          goals={activeGoals}
          today={today}
          canContribute
          emptyIcon={<HandCoins className="w-6 h-6 text-muted-foreground"/>}
          emptyText="No active savings goals yet."
        />
      ) : (
        <SavingsGoalList
          goals={completedGoals}
          today={today}
          canContribute={false}
          emptyIcon={<CircleCheckBig className="w-6 h-6 text-muted-foreground"/>}
          emptyText="No completed goals yet."
        />
      )}
    </div>
  );
}
