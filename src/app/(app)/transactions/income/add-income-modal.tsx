"use client";

import { useState } from "react";
import { createIncome } from "@/app/(app)/transactions/income/actions";
import { CirclePlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

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
  const { execute, isPending } = useServerAction(createIncome, {
    successTitle: "Income saved",
    errorTitle: "Income not saved",
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
        className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium bg-card text-foreground border border-border-strong cursor-pointer shadow-md hover:border-primary hover:text-primary transition"
      >
        <CirclePlus className="w-4 h-4 text-primary" />
        Add income
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add income"
        description="Record money coming into one of your accounts."
        width="md"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="p-5 pt-2">
              <div className="grid gap-1">
                <div>
                  <input
                    type="number"
                    name="amount"
                    min="0.01"
                    step="0.01"
                    placeholder="Amount, e.g., $100.00"
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
                  <div className="relative mt-1">
                    <select
                      name="categoryId"
                      defaultValue=""
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none transition-colors
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
                  <input
                    type="date"
                    name="transactionDate"
                    defaultValue={today}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-border-focus"
                    required
                  />
                </div>

                <div>
                  <input
                    name="note"
                    placeholder="Optional note"
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-border-focus"
                  />
                </div>
              </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save income"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}
