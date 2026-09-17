import { LoadingButton } from "@/components/ui/loading-button";

export function ModalFormActions({
  onCancel,
  isPending,
  submitLabel,
  pendingLabel,
  submitClassName = "bg-primary text-white hover:bg-primary-hover",
  isSubmitDisabled = false,
}: {
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  submitClassName?: string;
  isSubmitDisabled?: boolean;
}) {
  return (
    <div className="mt-5 flex justify-end gap-3 border-t border-border pt-5">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPending}
        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <LoadingButton
        isLoading={isPending}
        loadingText={pendingLabel}
        disabled={isSubmitDisabled || isPending}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${submitClassName}`}
      >
        {submitLabel}
      </LoadingButton>
    </div>
  );
}
