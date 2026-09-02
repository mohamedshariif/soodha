"use client";

import { useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createAccount } from "./actions";
import { useToast } from "@/components/ui/toast-provider";
import { LoadingButton } from "@/components/ui/loading-button";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/mobile-money-providers";

type AccountType = "CASH" | "BANK" | "MOBILE_MONEY";

export function AddAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [accountType, setAccountType] = useState<AccountType>("CASH");
  const formRef = useRef<HTMLFormElement>(null);

  const { showToast } = useToast();

  function closeModal() {
    if (isPending) return;
    setIsOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createAccount(formData);
      
      if (!result.ok) {
        showToast({
          type: "error",
          title: "Account not created",
          message: result.message,
        });
        return;
      }

      formRef.current?.reset();
      setAccountType("CASH");
      setIsOpen(false);
      showToast({
        type: "success",
        title: "Account created",
        message: result.message,
      });
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
      >
        Add account
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">ADD NEW ACCOUNT</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                aria-label="Close"
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5">
              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    ACCOUNT TYPE
                  </label>
                  <select
                    name="type"
                    value={accountType}
                    onChange={(event) => setAccountType(event.target.value as AccountType)}
                    disabled={isPending}
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK">Bank</option>
                    <option value="MOBILE_MONEY">Mobile money</option>
                  </select>
                </div>

                {accountType === "MOBILE_MONEY" ? (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      PROVIDER
                    </label>
                    <select
                      name="provider"
                      defaultValue=""
                      disabled={isPending}
                      required
                      className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
                    >
                      <option value="" disabled>
                        Select provider
                      </option>
                      {MOBILE_MONEY_PROVIDERS.map((provider) => (
                        <option
                          key={provider}
                          value={provider}
                        >
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>
                ): (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      PROVIDER
                    </label>
                    <input
                      name="provider"
                      value={accountType === "CASH" ? "Cash" : "Bank"}
                      readOnly
                      tabIndex={-1}
                      className="mt-1 w-full cursor-not-allowed rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground outline-none"
                     />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    ACCOUNT NAME
                  </label>
                  <input
                    name="name"
                    placeholder="e.g. My Cash, EVC Plus, Salaam Bank"
                    disabled={isPending}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    PENINING BALANCE
                  </label>
                  <input
                    name="openingBalance"
                    type="number"
                    placeholder="0.00"
                    disabled={isPending}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-border pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>

                <LoadingButton
                  isLoading={isPending}
                  loadingText="Saving..."
                  disabled={isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save account
                </LoadingButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}