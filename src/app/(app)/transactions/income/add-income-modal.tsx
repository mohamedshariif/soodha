"use client";

import { useState, useTransition } from "react";
import { createIncome } from "@/app/(app)/transactions/income/actions";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/toast-provider";

import { CirclePlus, X } from "lucide-react";

export function AddIncomeModal({
  incomeCategories,
  accounts,
  today,
}: {
  incomeCategories: { id: string; name: string }[];
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
      const result = await createIncome(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Income not saved",
          message: result.message,
        });

        return;
      }

      setIsOpen(false);

      showToast({
        type: "success",
        title: "Income saved",
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
        className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium bg-card text-foreground border border-border-strong cursor-pointer shadow-md hover:border-primary hover:text-primary transition"
      >
        <CirclePlus className="w-4 h-4 text-primary" />
        Add income
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">Add income</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Record money coming into one of your accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                aria-label="Close"
                className="rounded-full p-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground "
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    placeholder="100.00"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <div className="relative mt-1">
                    <select
                      name="categoryId"
                      defaultValue=""
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors
                    hover:border-border-strong focus:border-border-focus"
                      required
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      {incomeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account
                  </label>

                  <select
                    name="accountId"
                    defaultValue={defaultAccount?.id ?? accounts[0]?.id}
                    className="mt-1 w-full rounded-lg border border-border text-foreground px-3 py-2 text-sm outline-none transition-colors
                    hover:border-border-strong focus:border-border-focus"
                    required
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
                  <label className="text-sm font-medium text-muted-foreground">
                    Date
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-border-focus"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Note
                  </label>
                  <input
                    name="note"
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-border-focus"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-5">
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
                  disabled={isPending}
                  className="
                  rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save income
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
