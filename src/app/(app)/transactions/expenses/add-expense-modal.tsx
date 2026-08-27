"use client";

import { useState, useTransition } from "react";
import { createExpense } from "@/app/(app)/transactions/expenses/actions";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/toast-provider";
import { CircleMinus, X } from "lucide-react";

export function AddExpenseModal({
  expenseCategories,
  accounts,
  today,
}: {
  expenseCategories: { id: string; name: string }[];
  accounts: {
    id: string;
    name: string;
    type: string;
    currency: string;
    isDefault: boolean;
  }[];
  today: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { showToast } = useToast();

  const defaultAccount = accounts.find((account) => account.isDefault);

  function closeModal() {
    if (isPending) return;

    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createExpense(formData);

      if (!result.ok) {

        showToast({
          type: "error",
          title: "Expense not saved",
          message: result.message,
        });

        return;
      }

      setIsOpen(false);

      showToast({
        type: "success",
        title: "Expense saved",
        message: result.message,
      });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
        }}
        className="flex items-center gap-1 rounded-lg bg-card px-4 py-2 text-sm font-medium text-foreground border border-border-strong cursor-pointer shadow-md hover:border-red-500 hover:text-red-500 transition"
      >
        <CircleMinus className="w-4 h-4 text-red-600"/>
        Add expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-slate-900">Add expense</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record money going out from one of your accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                disabled={isPending}
                className="rounded-full p-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-4"/>
              </button>
            </div>

            <form 
              onSubmit={handleSubmit} 
              className="p-5"
            >

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="25.00"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    defaultValue=""
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Account
                  </label>
                  <select
                    name="accountId"
                    defaultValue={defaultAccount?.id ?? accounts[0]?.id}
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="" disabled>
                      Select account
                    </option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} · {account.currency}
                        {account.isDefault ? " · Default" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Date
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">
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
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <LoadingButton
                  isLoading={isPending}
                  loadingText="Saving..."
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-red-700 cursor-pointer"
                >
                  Save expense
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}