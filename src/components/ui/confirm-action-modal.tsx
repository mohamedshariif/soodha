"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

  const Icon = tone === "danger" ? AlertTriangle : CheckCircle2;
  const iconColor = tone === "danger" ? "text-red-600" : "text-emerald-600";
  const confirmClassName = tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg bg-muted p-2 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
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
    </div>
  );
}