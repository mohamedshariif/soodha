"use client";

import { useState } from "react";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import {
  formatDateForDisplay,
  parseDateInputToTransactionDate,
} from "@/lib/date";
import { markBillAsPaid } from "../actions";
import { useServerAction } from "@/lib/use-server-action";

export function MarkBillPaidButton({
  billId,
  billName,
  dueDate,
  variant = "due",
  className,
}: {
  billId: string;
  billName: string;
  dueDate: string;
  variant?: "due" | "early";
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { execute, isPending } = useServerAction(markBillAsPaid, {
    successTitle: "Bill paid",
    errorTitle: "Couldn't mark as paid",
  });
  const isEarly = variant === "early";

  function handleConfirm() {
    const formData = new FormData();
    formData.set("billId", billId);
    formData.set("dueDate", dueDate);

    execute(formData, () => setIsOpen(false));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ??
          (isEarly
            ? "flex-1 rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-200 cursor-pointer transition-all duration-300"
            : "flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-hover cursor-pointer")
        }
      >
        {isEarly ? "Pay early" : "Pay"}
      </button>

      <ConfirmActionModal
        isOpen={isOpen}
        tone="default"
        title={
          isEarly ? `Pay "${billName}" early?` : `Mark "${billName}" as paid?`
        }
        description={
          isEarly
            ? `This bill isn't due until ${formatDateForDisplay(parseDateInputToTransactionDate(dueDate))}. Marking it paid now still records a real expense and deducts it from your account balance.`
            : "This records a real expense transaction and deducts it from your default account balance."
        }
        confirmLabel="Confirm"
        pendingLabel="Saving..."
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
