"use client";

import { useState, useTransition } from "react";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { useToast } from "@/components/ui/toast-provider";
import { cancelTransaction } from "../actions";
import { Trash2 } from "lucide-react";

export function DeleteTransactionButton({
  transactionId,
}: {
  transactionId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("transactionId", transactionId);

    startTransition(async () => {
      const result = await cancelTransaction(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't delete transaction",
          message: result.message,
        });
        return;
      }

      setIsOpen(false);
      showToast({
        type: "success",
        title: "Transaction deleted",
        message: result.message,
      });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Delete transacton"
        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmActionModal
        isOpen={isOpen}
        tone="danger"
        title="Delete this transaction?"
        description="Your account balance will be adjusted to reflect the removal."
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
