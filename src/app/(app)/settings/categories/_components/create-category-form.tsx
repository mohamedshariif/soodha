"use client";

import { useState } from "react";
import { createCategory } from "../actions";
import { CATEGORY_COLORS } from "@/lib/colors/category-colors";
import { useServerAction } from "@/lib/use-server-action";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddButton } from "@/components/ui/add-button";

export function CreateCategoryForm() {
  const [isOpen, setIsOpen] = useState(false);

  const { execute, isPending } = useServerAction(createCategory, {
    successTitle: "Category created",
    errorTitle: "Category not created"
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    execute(formData, () => {
      setIsOpen(false);
      form.reset();
    });
  }

  return (
    <>
    <div>
      <FloatingActionButton>
        <AddButton label="Add category" onClick={() => setIsOpen(true)}/>
      </FloatingActionButton>
    </div>

    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Add category"
      description="Manage your income and expenses categories"
      width="md"
      isDismissDisabled={isPending}
    >

      <form
      onSubmit={handleSubmit}
      className=" p-5"
    >
      <div className="grid gap-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
            Category name
          </label>
          <input
            id="name"
            name="name"
            placeholder="e.g. Coffee"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-md text-foreground outline-none focus:border-primary disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label htmlFor="type" className="text-sm font-medium text-muted-foreground">
            Type
          </label>
          <select
            id="type"
            name="type"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-md text-foreground outline-none focus:border-primary disabled:opacity-50"
            defaultValue="EXPENSE"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium text-muted-foreground">
          Color
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORY_COLORS.map((color, index) => (
            <label key={color} className="relative cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={index === 0}
                disabled={isPending}
                className="peer sr-only"
              />
              <span
                className="block h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card ring-transparent peer-checked:ring-foreground"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      <ModalFormActions 
        onCancel={() => setIsOpen(false)}
        isPending={isPending}
        submitLabel="Add category"
        pendingLabel="Adding..."
      />
    </form>

    </Modal>
    </>
  );
}
