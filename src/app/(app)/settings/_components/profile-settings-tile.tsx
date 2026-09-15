"use client";

import { useState, useTransition } from "react";
import { CircleUserRound } from "lucide-react";
import { SettingsCard } from "./settings-card";
import { useToast } from "@/components/ui/toast-provider";
import { updateProfileDisplayName } from "../actions";
import { X } from "lucide-react";

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

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">Profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  This name is used inside Soodha for greetings and display.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="text-sm font-medium text-foreground">
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
                <label className="text-sm font-medium text-foreground">
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

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
