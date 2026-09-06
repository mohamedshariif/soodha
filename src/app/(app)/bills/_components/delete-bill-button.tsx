"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { useToast } from "@/components/ui/toast-provider";
import { archiveBill } from "../actions";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";

export function DeleteBillButton({
  billId,
  billName,
}: {
  billId: string;
  billName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  
  function handleConfirm() {
    const formData = new FormData();
    formData.set("billId", billId);

    startTransition(async () => {
      const result = await archiveBill(formData);

      if (!result.ok) {
        showToast({ type: "error", title: "Couldn't delete bill", message: result.message });
        return;
      }

      setIsOpen(false);
      showToast({ type: "success", title: "Bill deleted", message: result.message });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Delete ${billName}`}
        className="shrink-0 rounded-full bg-muted p-3 text-red-500 hover:bg-muted/50 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmActionModal
        isOpen={isOpen}
        tone="danger"
        title={`Delete "${billName}"?`}
        description="Bills with payment history are archived; bills with no payments are deleted."
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />

      {/* <ConfirmDeleteModal 
        isOpen={isOpen}
        title={`Delete "${billName}"?`}
        description="Bill with payment hşstory are archived; bills with no payments are deleted."
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      /> */}
    </>
  );

}