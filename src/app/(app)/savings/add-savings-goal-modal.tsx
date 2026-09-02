"use client";

import { useRef, useState, useTransition } from "react";
import { createSavingsGoal } from "./actions";
import { useToast } from "@/components/ui/toast-provider";
import { X } from "lucide-react";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddButton } from "@/components/ui/add-button";

export function AddSavingsGoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createSavingsGoal(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Goal not created.",
          message: result.message,
        });
      }

      formRef.current?.reset();
      setIsOpen(false);

      showToast({
        type: "success",
        title: "Goal created",
        message: result.message,
      });
    });
  }

  return (
    <>
      <div className="flex items-center ">
        <FloatingActionButton>
          <AddButton label="Add Goal" onClick={() => setIsOpen(true)} />
        </FloatingActionButton>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">
                  Add savings goal
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a goal you want to save toward.
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
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Goal name
                  </label>
                  <input
                    name="name"
                    placeholder="e.g. Emergency"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Target amount
                  </label>
                  <input
                    name="targetAmount"
                    placeholder="1000.00"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
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
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 cursor-pointer"
                >
                  {isPending ? "Saving..." : "Save goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
