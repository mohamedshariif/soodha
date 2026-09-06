"use client";

import { useRef, useState, useTransition } from "react";
import { AddButton } from "@/components/ui/add-button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useToast } from "@/components/ui/toast-provider";
import { createBill } from "./actions";
import { X } from "lucide-react";

type ExpenseCategoryOption = {
  id: string;
  name: string;
};

export function AddBillModal({
  expenseCategories,
  today,
}: {
  expenseCategories: ExpenseCategoryOption[];
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
      const result = await createBill(formData);

      if (!result.ok) {
        showToast({ type: "error", title: "Couldn't add bill", message: result.message });
        return;
      }

      formRef.current?.reset();
      setIsOpen(false);
      showToast({ type: "success", title: "Bill added", message: result.message });
    });
  }

  return (
    <>
      <FloatingActionButton>
        <AddButton label="Add Bill" onClick={() => setIsOpen(true)} />
      </FloatingActionButton>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">Add bill</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track a bill before it becomes a real expense.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bill name</label>
                  <input
                    name="name"
                    placeholder="e.g. Internet"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <input
                    name="amount"
                    placeholder="30.00"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expense category</label>
                  <select
                    name="categoryId"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select category</option>
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due date</label>
                  <input
                    type="date"
                    name="nextDueDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Repeat</label>
                  <select
                    name="repeatType"
                    defaultValue="MONTHLY"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="NONE">Does not repeat</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
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
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}