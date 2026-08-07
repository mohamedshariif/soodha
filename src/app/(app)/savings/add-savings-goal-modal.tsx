"use client";

import { useRef, useState, useTransition } from "react";
import { createSavingsGoal } from "./actions";

export function AddSavingsGoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await createSavingsGoal(formData);
      formRef.current?.reset();
      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Add savings goal
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Add savings goal
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a goal you want to save toward.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Goal name
                  </label>
                  <input
                    name="name"
                    placeholder="e.g. Emergency fund"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Target amount
                  </label>
                  <input
                    name="targetAmount"
                    placeholder="1000.00"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Note
                  </label>
                  <input
                    name="note"
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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