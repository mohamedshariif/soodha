"use client";

import { useState } from "react";
import { createDebt } from "../actions";
import type { DebtDirection } from "@/generated/prisma/enums";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddButton } from "@/components/ui/add-button";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

const DIRECTIONS: { value: DebtDirection; label: string }[] = [
  { value: "I_OWE", label: "I owe (Payable)" },
  { value: "OWED_TO_ME", label: "Owed to me (Receivable)" },
];

export function AddDebtModal({
  defaultDirection = "I_OWE",
}: {
  defaultDirection?: DebtDirection;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<DebtDirection>(defaultDirection);

  const { execute, isPending } = useServerAction(createDebt, {
    successTitle: "Debt created",
    errorTitle: "Debt not created."
  });

  const [error, setError] = useState<string | null>(null);

  const isPayable = direction === "I_OWE";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    execute(formData, () => {
      setIsOpen(false);
    });
  }

  return (
    <>
      <div className="flex items-center ">
        <FloatingActionButton>
          <AddButton
            label="Add Debt"
            onClick={() => {
              setError(null)
              setIsOpen(true)
            } }/>
        </FloatingActionButton>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Debt"
        description="Track money you owe, or money someone owes you."
        width="lg"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-2 gap-2 rounded-full border border-border bg-muted p-1">
            {DIRECTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDirection(option.value)}
                className={`rounded-full py-2 text-sm font-semibold transition-colors ${direction === option.value
                  ? isPayable
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="direction" value={direction} />

          <div className="mt-4 grid gap-2">
            <div>
              <label
                htmlFor="debtName"
                className="text-sm font-medium text-foreground">
                {isPayable ? "Debt name" : "What's it for"}
              </label>
              <input
                id="debtName"
                name="name"
                placeholder={isPayable ? "e.g. Laptop loan" : "e.g. Rent I covered for Alex"}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="personName"
                className="text-sm font-medium text-foreground">
                {isPayable ? "Lender" : "Who owes you"}
              </label>
              <input
                id="personName"
                name="counterpartyName"
                placeholder={isPayable ? "e.g. Laptop store" : "e.g. Alex"}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className={`${isPayable && "grid grid-cols-2 gap-2"}`}>
              <div>
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-foreground">Amount</label>
                <input
                  id="amount"
                  name="originalAmount"
                  placeholder="$500.00"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              {isPayable && (
                <div>
                  <label
                    htmlFor="minAmount"
                    className="text-sm font-medium text-foreground">
                    Minimum payment
                  </label>
                  <input
                    id="minAmount"
                    name="minimumPayment"
                    placeholder="e.g. $50 every month"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="date"
                className="text-sm font-medium text-foreground">
                {isPayable ? "Due date" : "Expected by"}
              </label>
              <input
                id="date"
                type="date"
                name="dueDate"
                className="mt-1 sm:w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label
                htmlFor="note"
                className="text-sm font-medium text-foreground">Note</label>
              <input
                id="note"
                name="note"
                placeholder="Optional note"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save debt"
            pendingLabel="Savings..."
            submitClassName={`${isPayable ? "bg-green-700 text-white" : "bg-primary text-primary-foreground"}`}
          />
        </form>
      </Modal>
    </>
  );
}
