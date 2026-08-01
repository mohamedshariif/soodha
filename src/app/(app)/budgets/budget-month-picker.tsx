"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function BudgetMonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Budget month
          </label>
          <input
            type="month"
            value={month}
            onChange={(event) => {
              const nextMonth = event.target.value;

              startTransition(() => {
                router.replace(`/budgets?month=${nextMonth}`, {
                  scroll: false,
                });
              });
            }}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        {isPending && (
          <p className="text-sm font-medium text-slate-500">Loading...</p>
        )}
      </div>
    </div>
  );
}