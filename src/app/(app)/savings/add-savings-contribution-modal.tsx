"use client";

import { useRef, useState } from "react";
import { addSavingsContribution } from "./actions";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

export function AddSavingsContributionModal({
  savingsGoalId,
  savingsGoalName,
  today,
}: {
  savingsGoalId: string;
  savingsGoalName: string;
  today: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { execute, isPending } = useServerAction(addSavingsContribution, {
    successTitle: "Contribution added",
    errorTitle: "Contribution not added",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    execute(formData, () => {
      formRef.current?.reset();
      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 text-sm font-semibold rounded-lg text-primary border border-border hover:bg-primary-hover hover:text-white transition-all duration-300 py-2.5 cursor-pointer"
      >
        Add Money
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add contribution"
        description={`Add money toward ${savingsGoalName}.`}
        width="sm"
        isDismissDisabled={isPending}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="p-5">
          <input type="hidden" name="savingsGoalId" value={savingsGoalId} />

          <div className="grid gap-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Amount
              </label>
              <input
                name="amount"
                placeholder="50.00"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                name="contributionDate"
                defaultValue={today}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Note
              </label>
              <input
                name="note"
                placeholder="Optional note"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save contribution"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}
