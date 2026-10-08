"use client";

import { useState } from "react";
import { resetMonth } from "../_actions/reset-month";
import { useServerAction } from "@/lib/use-server-action";

// Must match CONFIRMATION_TEXT in the server action.
const CONFIRMATION_TEXT = "RESET";

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);

  if (!year || !month) return "";

  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function ResetMonthCard() {
  const [month, setMonth] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const { execute, isPending } = useServerAction(resetMonth, {
    successTitle: "Month reset",
    errorTitle: "Could not reset month",
  });

  const monthLabel = formatMonth(month);
  const canSubmit = month !== "" && confirmation === CONFIRMATION_TEXT && !isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    execute(new FormData(event.currentTarget), () => setConfirmation(""));
  }

  return (
    <section className="rounded-xl border border-danger/40 bg-card p-6">
      <h3 className="text-base font-semibold text-danger">Reset a month</h3>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        Permanently deletes every transaction and budget in the month you pick, along
        with the bill, savings and debt payments linked to them. Account balances,
        savings goals, debts and upcoming bills are recalculated afterwards. This
        can&apos;t be undone.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="reset-month" className="text-sm font-medium text-foreground">
            Month to reset
          </label>
          <input
            id="reset-month"
            name="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            disabled={isPending}
            required
            className="block w-full max-w-xs sm:max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground focus:border-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reset-confirmation" className="text-sm font-medium text-foreground">
            Type <span className="font-mono">{CONFIRMATION_TEXT}</span> to confirm
          </label>
          <input
            id="reset-confirmation"
            name="confirmation"
            type="text"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={isPending}
            className="block w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 font-mono text-md text-foreground focus:border-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
          />
        </div>

        <div className="flex justify-end border-t border-danger/40 pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Resetting…" : monthLabel ? `Reset ${monthLabel}` : "Reset month"}
          </button>
        </div>
      </form>
    </section>
  );
}
