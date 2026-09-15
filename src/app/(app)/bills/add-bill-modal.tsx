"use client";

import { useRef, useState } from "react";
import { AddButton } from "@/components/ui/add-button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { createBill } from "./actions";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

type ExpenseCategoryOption = {
  id: string;
  name: string;
};

export function AddBillModal({
  expenseCategories,
  today,
}: {
  expenseCategories: ExpenseCategoryOption[];
  today: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { execute, isPending } = useServerAction(createBill, {
    successTitle: "Bill added",
    errorTitle: "Couldn't add bill",
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
      <FloatingActionButton>
        <AddButton label="Add Bill" onClick={() => setIsOpen(true)} />
      </FloatingActionButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add bill"
        description="Track a bill before it becomes a real expense."
        width="md"
        isDismissDisabled={isPending}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Bill name
              </label>
              <input
                name="name"
                placeholder="e.g. Internet"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Amount
              </label>
              <input
                name="amount"
                placeholder="30.00"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Expense category
              </label>
              <select
                name="categoryId"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              >
                <option value="">Select category</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Due date
              </label>
              <input
                type="date"
                name="nextDueDate"
                defaultValue={today}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Repeat
              </label>
              <select
                name="repeatType"
                defaultValue="MONTHLY"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="NONE">Does not repeat</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save bill"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}
