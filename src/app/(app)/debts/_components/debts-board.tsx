"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DebtCard } from "./debt-card";
import type { DebtDirection } from "@/generated/prisma/enums";

type DebtRecord = {
  id: string;
  name: string;
  lenderName: string | null;
  direction: DebtDirection;
  originalAmountMinor: bigint;
  remainingAmountMinor: bigint;
  currency: string;
  dueDate: Date | null;
  minimumPaymentMinor: bigint | null;
    note: string | null;
  status: string;
  payments: { id: string; amountMinor: bigint; currency: string; paidAt: Date }[];
};

type FilterKey = "all" | "I_OWE" | "OWED_TO_ME" | "history";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "I_OWE", label: "You owe" },
  { key: "OWED_TO_ME", label: "Owed to you" },
  { key: "history", label: "Paid / history" },
];

export function DebtsBoard({ debts, today }: { debts: DebtRecord[]; today: string }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const matchesFilter =
        filter === "all"
          ? debt.status === "ACTIVE"
          : filter === "history"
            ? debt.status === "PAID_OFF"
            : debt.status === "ACTIVE" && debt.direction === filter;

      if (!matchesFilter) return false;
      if (!query.trim()) return true;

      const needle = query.trim().toLowerCase();
      return (
        debt.name.toLowerCase().includes(needle) ||
        (debt.lenderName?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [debts, filter, query]);

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${
                filter === option.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

      <div className="relative mt-2 sm:mt-0 w-full sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or lender..."
          className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-md text-foreground outline-none focus:border-primary"
        />
      </div>

      </div>

      <div className="mt-4 pb-10 grid gap-2 sm:grid-cols-2 sm:gap-4">
        {filteredDebts.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {query.trim() ? "No debts match your search." : "Nothing here yet."}
            </p>
          </div>
        ) : (
          filteredDebts.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              today={today}
              canRecordPayment={debt.status === "ACTIVE"}
            />
          ))
        )}
      </div>
    </section>
  );
}
