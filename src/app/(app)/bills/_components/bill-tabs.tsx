"use client";

import { useState } from "react";
import { BillList } from "./bill-list";
import { PaidBillsList } from "./paid-bills-list";
import type { BillCard } from "./bill-card";

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
    { key: "upcoming" as const, label: "Upcoming", count: upcomingBills.length },
    { key: "overdue" as const, label: "Overdue", count: overdueBills.length },
    { key: "paid" as const, label: "Paid", count: paidPayments.length },
  ];

  return (
    <div>
      <div className="inline-flex rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label} {t.count}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "upcoming" && (
          <BillList
            title="Upcoming bills"
            helper="Not yet overdue"
            bills={upcomingBills}
            today={today}
            emptyText="No upcoming bills."
          />
        )}

        {tab === "overdue" && (
          <BillList
            title="Overdue bills"
            helper="Past due"
            bills={overdueBills}
            today={today}
            emptyText="No overdue bills. Nice."
          />
        )}

        {tab === "paid" && <PaidBillsList payments={paidPayments} />}
      </div>
    </div>
  );
}