"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel,
  pendingLabel,
  tone = "danger",
  isPending,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  tone?: "danger" | "default";
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  const iconColor = tone === "danger" ? "text-red-600" : "text-emerald-600";
  const confirmClassName =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-emerald-600 hover:bg-emerald-700";
  const headerAdornment =
    tone === "danger" ? (
      <div className={`rounded-lg bg-muted p-2 ${iconColor}`}>
        <AlertTriangle className="h-5 w-5" />
      </div>
    ) : (
      <div className={`rounded-lg bg-muted p-2 ${iconColor}`}>
        <CheckCircle2 className="h-5 w-5" />
      </div>
    );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      width="sm"
      headerAdornment={headerAdornment}
      showCloseButton={false}
      isDismissDisabled={isPending}
    >
      <div className="p-4">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${confirmClassName}`}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
