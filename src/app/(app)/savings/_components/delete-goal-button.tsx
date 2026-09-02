import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { useToast } from "@/components/ui/toast-provider";
import { archiveSavingsGoal } from "../actions";

export function DeleteGoalButton({
  goalId,
  goalName,
}: {
  goalId: string;
  goalName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("savingsGoalId", goalId);

    startTransition(async () => {
      const result = await archiveSavingsGoal(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't delete goal",
          message: result.message,
        });
        return;
      }

      setIsOpen(false);
      showToast({
        type: "success",
        title: "Goal deleted",
        message: result.message,
      });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer text-red-500"
        aria-label={`Delete ${goalName}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ConfirmDeleteModal
        isOpen={isOpen}
        title={`Delete "${goalName}"?`}
        description="Goals wirh contributon hsitory are archived; goals with no contribution are deleted. "
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
