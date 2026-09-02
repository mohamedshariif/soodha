"use client";

import { useRef, useState, useTransition } from "react";
import { addSavingsContribution } from "./actions";
import { useToast } from "@/components/ui/toast-provider";
import { X } from "lucide-react";

export function AddSavingsContributionModal({
  savingsGoalId,
  savingsGoalName,
  today,
}: {
  savingsGoalId: string;
  savingsGoalName: string;
  today: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await addSavingsContribution(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Contribution not added",
          message: result.message,
        });
        return;
      }
      formRef.current?.reset();
      setIsOpen(false);
      showToast({
        type: "success",
        title: "Contribution added",
        message: result.message,
      });
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 text-xs font-medium text-primary-hover border border-border rounded-xl hover:text-primary hover:bg-muted duration-300 p-2 cursor-pointer"
      >
        Add Money
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Add contribution
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add money toward
                  <span className="font-bold text-foreground">
                    {" "}
                    {savingsGoalName}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5">
              <input type="hidden" name="savingsGoalId" value={savingsGoalId} />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <input
                    name="amount"
                    placeholder="50.00"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Date
                  </label>
                  <input
                    type="date"
                    name="contributionDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Note
                  </label>
                  <input
                    name="note"
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  disabled={isPending}
                  className="rounded-lg bg-primary/70 px-4 py-2 text-sm font-medium text-white hover:bg-primary/40 transition-colors duration-300 cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save contribution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
