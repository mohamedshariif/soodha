"use client";

import { useRef, useState } from "react";
import { createAccount } from "./actions";
import { MOBILE_MONEY_PROVIDERS } from "@/lib/mobile-money-providers";
import { AddButton } from "@/components/ui/add-button";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useServerAction } from "@/lib/use-server-action";

type AccountType = "CASH" | "BANK" | "MOBILE_MONEY";

export function AddAccountModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("CASH");
  const formRef = useRef<HTMLFormElement>(null);
  const { execute, isPending } = useServerAction(createAccount, {
    successTitle: "Account created",
    errorTitle: "Account not created",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    execute(formData, () => {
      formRef.current?.reset();
      setAccountType("CASH");
      setIsOpen(false);
    });
  }

  return (
    <>
      <FloatingActionButton>
        <AddButton label="Add Account" onClick={() => setIsOpen(true)} />
      </FloatingActionButton>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add new account"
        width="md"
        isDismissDisabled={isPending}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                ACCOUNT TYPE
              </label>
              <select
                name="type"
                value={accountType}
                onChange={(event) =>
                  setAccountType(event.target.value as AccountType)
                }
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
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
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
              />
            </div>
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            submitLabel="Save account"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}
