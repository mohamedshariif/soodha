"use client";

import { useState, useTransition } from "react";
import { CircleUserRound } from "lucide-react";
import { SettingsCard } from "./settings-card";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useToast } from "@/components/ui/toast-provider";
import { updateProfileDisplayName } from "../actions";

export function ProfileSettingsTile({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateProfileDisplayName(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't update profile",
          message: result.message,
        });
        return;
      }

      setIsOpen(false);
      showToast({
        type: "success",
        title: "Profile updated",
        message: result.message,
      });
    });
  }

  return (
    <>
      <SettingsCard
        icon={CircleUserRound}
        title="Profile"
        description={fullName || "Add your display name"}
        onClick={() => setIsOpen(true)}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Profile"
        description="This name is used inside Soodha for greetings and display."
        width="md"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Full name
            </label>
            <input
              name="fullName"
              defaultValue={fullName}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <input
              value={email}
              disabled
              className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email and sign-in are managed by your account provider.
            </p>
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save profile"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}
