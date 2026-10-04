"use client";

import { useState } from "react";
import { recordDebtPayment } from "./actions";
import type { DebtDirection } from "@/generated/prisma/enums";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

export function RecordDebtPaymentModal({
  debtId,
  debtName,
  direction,
  today,
  className,
}: {
  debtId: string;
  debtName: string;
  direction: DebtDirection;
  today: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { execute, isPending } = useServerAction(recordDebtPayment, {
    successTitle: "Debt recorded",
    errorTitle: "Debt not recorded."
  });

  const [error, setError] = useState<string | null>(null);

  const isPayable = direction === "I_OWE";
  const actionLabel = isPayable ? "Make payment" : "Record collection";

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
          setError(null)
          setIsOpen(true)
        }}
        className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors cursor-pointer ${className}`}
      >
        {actionLabel}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setError(null)
          setIsOpen(false)
        }}
        title={actionLabel}
        description={
          isPayable
            ? `Record a payment toward ${debtName}.`
            : `Record a collection from ${debtName}.`
        }
        width="lg"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="p-5">
          <input type="hidden" name="debtId" value={debtId} />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Amount</label>
              <input
                name="amount"
                placeholder="50.00"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                {isPayable ? "Payment date" : "Date received"}
              </label>
              <input
                type="date"
                name="paidAt"
                defaultValue={today}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground">Note</label>
              <input
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
            onCancel={() => {
              setError(null)
              setIsOpen(false)
            }}
            isPending={isPending}
            submitLabel={`${isPayable ? "Record Payment" : "Record collection"}`}
            pendingLabel="Saving..."
            submitClassName={
              isPayable
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }
          />
        </form>
      </Modal>
    </>
  );
}
