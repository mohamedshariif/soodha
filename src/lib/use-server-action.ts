"use client";

import { useTransition } from "react";
import { type ActionResult } from "@/lib/action-result";
import { useToast } from "@/components/ui/toast-provider";

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export function useServerAction(
  action: ServerAction,
  {
    successTitle,
    errorTitle,
  }: {
    successTitle: string;
    errorTitle: string;
  },
) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function execute(formData: FormData, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        const result = await action(formData);

        if (!result.ok) {
          showToast({
            type: "error",
            title: errorTitle,
            message: result.message,
          });
          return;
        }

        onSuccess?.();
        showToast({
          type: "success",
          title: successTitle,
          message: result.message,
        });
      } catch {
        showToast({
          type: "error",
          title: errorTitle,
          message: "Something went wrong. Please try again.",
        });
      }
    });
  }

  return { execute, isPending };
}
