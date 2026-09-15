"use client";

import { useState } from "react";
import { BillList } from "./bill-list";
import { PaidBillsList } from "./paid-bills-list";
import type { BillCard } from "./bill-card";
import { CalendarClock, AlertTriangle } from "lucide-react";

type Bill = Parameters<typeof BillCard>[0]["bill"];
type Payment = Parameters<typeof PaidBillsList>[0]["payments"][number];

export function BillTabs({
  upcomingBills,
  overdueBills,
  paidPayments,
  today,
}: {
  upcomingBills: Bill[];
  overdueBills: Bill[];
  paidPayments: Payment[];
  today: Date;
}) {
  const [tab, setTab] = useState<"upcoming" | "overdue" | "paid">("upcoming");

  const tabs = [
    {
      key: "upcoming" as const,
      label: "Upcoming",
      count: upcomingBills.length,
    },
    { key: "overdue" as const, label: "Overdue", count: overdueBills.length },
    { key: "paid" as const, label: "Paid", count: paidPayments.length },
  ];

  return (
    <div>
      <div className="inline-flex rounded-lg bg-muted p-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-card text-foreground rounded-xl shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label} {t.count}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "upcoming" && (
          <BillList
            bills={upcomingBills}
            today={today}
            emptyIcon={
              <CalendarClock className="w-6 h-6 text-muted-foreground" />
            }
            emptyText="No upcoming bills."
          />
        )}

        {tab === "overdue" && (
          <BillList
            bills={overdueBills}
            today={today}
            emptyIcon={
              <AlertTriangle className="w-6 h-6 text-muted-foreground" />
            }
            emptyText="No overdue bills. Great."
          />
        )}

        {tab === "paid" && <PaidBillsList payments={paidPayments} />}
      </div>
    </div>
  );
}
