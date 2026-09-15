"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { type ActionResult } from "@/lib/action-result";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { useServerAction } from "@/lib/use-server-action";

type DeleteAction = (formData: FormData) => Promise<ActionResult>;

type DeleteActionButtonProps = {
  action: DeleteAction;
  actionData: Record<string, string>;
  itemName: string;
  description: string;
  successTitle: string;
  errorTitle: string;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
};

export function DeleteActionButton({
  action,
  actionData,
  itemName,
  description,
  successTitle,
  errorTitle,
  ariaLabel = `Delete ${itemName}`,
  className = "rounded-full p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600",
  iconClassName = "h-4 w-4",
}: DeleteActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { execute, isPending } = useServerAction(action, {
    successTitle,
    errorTitle,
  });

  function handleConfirm() {
    const formData = new FormData();

    for (const [key, value] of Object.entries(actionData)) {
      formData.set(key, value);
    }

    execute(formData, () => setIsOpen(false));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={ariaLabel}
        className={className}
      >
        <Trash2 className={iconClassName} />
      </button>

      <ConfirmActionModal
        isOpen={isOpen}
        tone="danger"
        title={`Delete "${itemName}"?`}
        description={description}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
