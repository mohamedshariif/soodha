"use client";

import { useState } from "react";
import { createIncome } from "@/app/(app)/transactions/income/actions";
import { ArrowUpRight } from "lucide-react";
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
          setIsOpen(true)
        }}
        className="flex items-center gap-2 border border-border-strong rounded-lg px-4 py-2 text-sm font-medium bg-card text-foreground shadow-md hover:border-primary/40 hover:text-primary transition cursor-pointer"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-primary">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
        Add Income
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add income"
        width="md"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="p-5 pt-2">
          <div className="grid gap-1">
            <div>
              <label
                htmlFor="amount"
                className="text-muted-foreground text-sm font-semibold"
              >
                Amount
              </label>
              <input
                id="amount"
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                placeholder="Amount, e.g., $100.00"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-md outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="text-muted-foreground text-sm font-semibold"
              >
                Description
              </label>
              <input
                id="description"
                name="description"
                placeholder="What was this for?"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-md outline-none focus:border-border-focus"
              />
            </div>

            <div>
              <div>
                <label
                  htmlFor="category"
                  className="text-muted-foreground text-sm font-semibold"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="categoryId"
                  defaultValue=""
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-md outline-none focus:border-primary"
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
              <label
                htmlFor="account"
                className="text-muted-foreground text-sm font-semibold"
              >
                Account
              </label>
              <select
                id="account"
                name="accountId"
                defaultValue={defaultAccount?.id ?? accounts[0]?.id}
                className="mt-1 w-full rounded-lg border border-border text-foreground px-3 py-2 text-md outline-none transition-colors
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

            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="text-muted-foreground text-sm font-semibold"
              >
                Date
              </label>
              <input
                id="date"
                type="date"
                name="transactionDate"
                defaultValue={today}
                className="mt-1 sm:w-full rounded-lg border border-border px-3 py-2 text-md outline-none focus:border-border-focus"
                required
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="text-muted-foreground text-sm font-semibold"
              >
                Note
              </label>
              <input
                id="note"
                name="note"
                placeholder="Optional note"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-md outline-none focus:border-border-focus"
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
