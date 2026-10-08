"use client";

import { useState } from "react";
import { deleteAccount } from "../_actions/delete-account";
import { useServerAction } from "@/lib/use-server-action";

// Where to send the user after deletion. Must be a public route
// (not the dashboard, which requires a signed-in user).
const AFTER_DELETE_PATH = "/";

export function DeleteAccountCard({ email }: { email: string }) {
  const [confirmation, setConfirmation] = useState("");

  const { execute, isPending } = useServerAction(deleteAccount, {
    successTitle: "Account deleted",
    errorTitle: "Could not delete account",
  });

  const canSubmit =
    confirmation.trim().toLowerCase() === email.toLowerCase() && !isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    execute(new FormData(event.currentTarget), () => {
      // Hard navigation (not router.replace) so Clerk's client state is
      // dropped along with the deleted session.
      window.location.assign(AFTER_DELETE_PATH);
    });
  }

  return (
    <section className="rounded-xl border border-danger/60 bg-card p-6">
      <h3 className="text-base font-semibold text-danger">Delete account</h3>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        Permanently deletes your account and everything in it: accounts,
        transactions, budgets, bills, savings goals and debts. You&apos;ll be signed
        out immediately. This can&apos;t be undone.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="delete-confirmation" className="text-sm font-medium text-foreground">
            Type <span className="font-mono font-semibold">{email}</span> to confirm
          </label>
          <input
            id="delete-confirmation"
            name="confirmation"
            type="email"
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={isPending}
            className="block w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-md text-foreground focus:border-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
          />
        </div>

        <div className="flex justify-end border-t border-danger/40 pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="justify-end rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </form>
    </section>
  );
}
