"use client";

import { useState, useTransition } from "react";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { useToast } from "@/components/ui/toast-provider";
import { formatDateForDisplay, parseDateInputToTransactionDate } from "@/lib/date";
import { markBillAsPaid } from "../actions";

export function MarkBillPaidButton({
  billId,
  billName,
  dueDate,
  variant = "due",
}: {
  billId: string;
  billName: string;
  dueDate: string;
  variant?: "due" | "early";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const isEarly = variant === "early";

  function handleConfirm() {
    const formData = new FormData();
    formData.set("billId", billId);
    formData.set("dueDate", dueDate);

    startTransition(async () => {
      const result = await markBillAsPaid(formData);

      if (!result.ok) {
        showToast({ type: "error", title: "Couldn't mark as paid", message: result.message });
        return;
      }

      setIsOpen(false);
      showToast({ type: "success", title: "Bill paid", message: result.message });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          isEarly
            ? "flex-1 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100 cursor-pointer"
            : "flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 cursor-pointer"
        }
      >
        {isEarly ? "Pay early" : "Pay"}
      </button>

      <ConfirmActionModal
        isOpen={isOpen}
        tone="default"
        title={isEarly ? `Pay "${billName}" early?` : `Mark "${billName}" as paid?`}
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