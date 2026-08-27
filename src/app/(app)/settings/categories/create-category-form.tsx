"use client";

import { useTransition } from "react";
import { createCategory } from "./actions";
import { useToast } from "@/components/ui/toast-provider";
import { LoadingButton } from "@/components/ui/loading-button";
import { CATEGORY_COLORS } from "@/lib/category-colors";

export function CreateCategoryForm() {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;

    startTransition(async () => {
      const result = await createCategory(formData);

      if (!result.ok) {
        showToast({ type: "error", title: "Category not created", message: result.message });
        return;
      }

      form.reset();
      showToast({ type: "success", title: "Category created", message: result.message });
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-border bg-card p-5"
    >
      <h2 className="font-semibold text-foreground">Create category</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Category name
          </label>
          <input
            name="name"
            placeholder="e.g. Coffee"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Type
          </label>
          <select
            name="type"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
            defaultValue="EXPENSE"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div className="flex items-end">
          <LoadingButton
            isLoading={isPending}
            loadingText="Adding..."
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add category
          </LoadingButton>
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
    </form>
  );
}