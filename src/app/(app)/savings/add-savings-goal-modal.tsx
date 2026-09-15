"use client";

import { useRef, useState } from "react";
import { createSavingsGoal } from "./actions";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddButton } from "@/components/ui/add-button";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

export function AddSavingsGoalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { execute, isPending } = useServerAction(createSavingsGoal, {
    successTitle: "Goal created",
    errorTitle: "Goal not created",
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
      <div className="flex items-center ">
        <FloatingActionButton>
          <AddButton label="Add Goal" onClick={() => setIsOpen(true)} />
        </FloatingActionButton>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add savings goal"
        description="Create a goal you want to save toward."
        width="lg"
        isDismissDisabled={isPending}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Goal name
              </label>
              <input
                name="name"
                placeholder="e.g. Emergency"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Target amount
              </label>
              <input
                name="targetAmount"
                placeholder="$200.00"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
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
            submitLabel="Save goal"
            pendingLabel="Saving..."
            submitClassName="bg-emerald-600 text-white hover:bg-emerald-700"
          />
        </form>
      </Modal>
    </>
  );
}
