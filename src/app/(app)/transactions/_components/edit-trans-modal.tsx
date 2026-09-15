"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { formatMinorUnitsForInput } from "@/lib/money";
import { formatDateForInput } from "@/lib/date";
import { updateTransaction } from "../actions";
import { SquarePen, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";

type CategoryOption = { id: string; name: string };

export function EditTransactionModal({
  transaction,
  categories,
}: {
  transaction: {
    id: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amountMinor: bigint;
    categoryId: string | null;
    transactionDate: Date;
    description: string | null;
    note: string | null;
  };
  categories: CategoryOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const isIncome = transaction.type === "INCOME";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateTransaction(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't update transaction",
          message: result.message,
        });
        return;
      }

      setIsOpen(false);
      showToast({
        type: "success",
        title: "Transaction updated",
        message: result.message,
      });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Edit transaction"
        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
      >
        <SquarePen className="w-4 h-4" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Edit transaction"
        description={`Update this ${isIncome ? "income" : "expense"} transaction.`}
        width="md"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="p-5 pt-2">
          <input type="hidden" name="transactionId" value={transaction.id} />

          <div className="mb-2 rounded-lg bg-muted px-4 py-2">
            <p
              className={`mt-1 font-semibold ${isIncome ? "text-emerald-600" : "text-red-600"}`}
            >
              {transaction.type}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Type is locked. To change income to expense, delete this
              transaction and create a new one.
            </p>
          </div>

          <div className="grid gap-1 grid-cols-2">
            <div>
              <input
                name="amount"
                defaultValue={formatMinorUnitsForInput(transaction.amountMinor)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <input
                name="description"
                defaultValue={transaction.description ?? ""}
                placeholder="What was this for?"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <select
                name="categoryId"
                defaultValue={transaction.categoryId ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="date"
                name="transactionDate"
                defaultValue={formatDateForInput(transaction.transactionDate)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <textarea
                name="note"
                placeholder="Optional note"
                defaultValue={transaction.note ?? ""}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                rows={3}
              />
            </div>
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save changes"
            pendingLabel="Savings..."
          />
        </form>
      </Modal>
    </>
  );
}
