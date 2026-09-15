"use client";

import { useState } from "react";
import { createExpense } from "@/app/(app)/transactions/expenses/actions";
import { CircleMinus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

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
  const { execute, isPending } = useServerAction(createExpense, {
    successTitle: "Expense saved",
    errorTitle: "Expense not saved",
  });

  const defaultAccount = accounts.find((account) => account.isDefault);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    execute(formData, () => {
      setIsOpen(false);
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

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add expense"
        description="Record money going out from one of your accounts."
        width="md"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="p-5 pt-2">

              <div className="grid gap-2">
                <div>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount, e.g., 25.00"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <input
                    name="description"
                    placeholder="What was this for?"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-border-focus"
                  />
                </div>

                <div>
                  <select
                    name="categoryId"
                    defaultValue=""
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
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
                  <select
                    name="accountId"
                    defaultValue={defaultAccount?.id ?? accounts[0]?.id}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
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
                  <input
                    type="date"
                    name="transactionDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <input
                    name="note"
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save expense"
            pendingLabel="Saving..."
            submitClassName="bg-red-600 text-white hover:bg-red-700"
          />
        </form>
      </Modal>
    </>
  );
}
