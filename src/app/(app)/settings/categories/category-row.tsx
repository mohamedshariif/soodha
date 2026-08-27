"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { updateCategory, deleteCategory } from "./actions";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmDeleteModal } from "../../../../components/ui/confirm-delete-modal";

type Category = {
  id: string;
  name: string;
  isDefault: boolean;
  icon: string | null;
  color: string | null;
};

export function CategoryRow({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const { showToast } = useToast();

  const Icon = getCategoryIcon(category.icon);
  const color = category.color ?? "#64748B";

  function handleUpdateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startSaveTransition(async () => {
      const result = await updateCategory(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Update failed",
          message: result.message
        });
        return;
      }

      setIsEditing(false);
      showToast({
        type: "success",
        title: "Category updated",
        message: result.message
      });
    });
  }

  function handleConfirmDelete() {
    const formData = new FormData();
    formData.set("categoryId", category.id);

    startDeleteTransition(async () => {
      const result = await deleteCategory(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Delete failed",
          message: result.message
        });
        return;
      }

      setIsDeleteModalOpen(false);
      showToast({
        type: "success",
        title: "Category deleted.",
        message: result.message
      });
    });
  }

   return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}1A` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </span>

          {isEditing ? (
            <form onSubmit={handleUpdateSubmit} className="flex items-center gap-1.5">
              <input type="hidden" name="categoryId" value={category.id} />
              <input
                name="name"
                defaultValue={category.name}
                autoFocus
                disabled={isSaving}
                className="w-32 rounded-md border border-border px-2 py-1 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSaving}
                aria-label="Save"
                className="rounded-full p-1 text-emerald-600 hover:bg-muted disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                aria-label="Cancel"
                className="rounded-full p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {category.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {category.isDefault ? "Default" : "Custom"}
              </p>
            </div>
          )}
        </div>

        {!category.isDefault && !isEditing && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit category"
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              aria-label="Delete category"
              className="rounded-full p-1.5 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title={`Delete "${category.name}"?`}
        description="If this category is used by any transactions, budgets, or bills, it will be archived instead of permanently deleted."
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
}