"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AddButton } from "@/components/ui/add-button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ALERT_THRESHOLD_PRESETS } from "@/lib/budgets";
import { createOrUpdateBudget } from "./actions";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

type ExpenseCategoryOption = { id: string; name: string };

export function AddBudgetModal({
  expenseCategories,
  currentMonth,
}: {
  expenseCategories: ExpenseCategoryOption[];
  currentMonth: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState<number>(75);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const { execute, isPending } = useServerAction(createOrUpdateBudget, {
    successTitle: "Budget saved",
    errorTitle: "Couldn't save budget",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("alertThresholdPercent", String(alertThreshold));
    const selectedMonth = formData.get("month")?.toString() ?? currentMonth;

    execute(formData, () => {
      formRef.current?.reset();
      setAlertThreshold(75);
      setIsOpen(false);
      router.push(`/budgets?month=${selectedMonth}`);
    });
  }

  return (
    <>
      <FloatingActionButton>
        <AddButton label="Add Budget" onClick={() => setIsOpen(true)} />
      </FloatingActionButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Set budget"
        description="Saving again for the same category and month updates it."
        width="md"
        isDismissDisabled={isPending}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Month
              </label>
              <input
                type="month"
                name="month"
                defaultValue={currentMonth}
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
                Budget amount
              </label>
              <input
                name="amount"
                placeholder="300.00"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Alert me at
              </label>
              <div className="mt-1 flex gap-2">
                {ALERT_THRESHOLD_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAlertThreshold(preset)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium cursor-pointer ${
                      alertThreshold === preset
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save budget"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}
