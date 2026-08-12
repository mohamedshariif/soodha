"use client";

import { useRef, useState, useTransition } from "react";
import { createExpense } from "@/app/(app)/expenses/actions";
import { FormAlert } from "@/components/ui/form-alert";
import { LoadingButton } from "@/components/ui/loading-button";
import { useToast } from "@/components/ui/toast-provider";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { showToast } = useToast();

  const defaultAccount = accounts.find((account) => account.isDefault);

  function closeModal() {
    if (isPending) return;

    setErrorMessage(null);
    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createExpense(formData);

      if (!result.ok) {
        setErrorMessage(result.message);

        showToast({
          type: "error",
          title: "Expense not saved",
          message: result.message,
        });

        return;
      }

      formRef.current?.reset();
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
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Add expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">Add expense</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Record money going out from one of your accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isPending}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5">
              {errorMessage && (
                <div className="mb-4">
                  <FormAlert message={errorMessage} />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Amount
                  </label>
                  <input
                    name="amount"
                    placeholder="25.00"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Account
                  </label>
                  <select
                    name="accountId"
                    defaultValue={defaultAccount?.id ?? accounts[0]?.id}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
                    required
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} · {account.currency}
                        {account.isDefault ? " · Default" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-500"
                    required
                  >
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <input
                    name="description"
                    placeholder="e.g. Food, transport, internet"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Note
                  </label>
                  <input
                    name="note"
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <LoadingButton
                  isLoading={isPending}
                  loadingText="Saving..."
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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