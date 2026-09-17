"use client";

import { useState, useTransition } from "react";
import { WalletCards } from "lucide-react";
import { SettingsCard } from "./settings-card";
import { Modal } from "@/components/ui/modal";
import { ModalFormActions } from "@/components/ui/modal-form-actions";
import { useToast } from "@/components/ui/toast-provider";
import { updateDefaultCurrency } from "../actions";

type CurrencyOption = {
  value: string;
  label: string;
};

export function CurrencySettingsTile({
  defaultCurrency,
  canChangeCurrency,
  currencyOptions,
}: {
  defaultCurrency: string;
  canChangeCurrency: boolean;
  currencyOptions: CurrencyOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateDefaultCurrency(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't update currency",
          message: result.message,
        });
        return;
      }

      setIsOpen(false);

      showToast({
        type: "success",
        title: "Currency updated",
        message: result.message,
      });
    });
  }

  return (
    <>
      <SettingsCard
        icon={WalletCards}
        title="Money preferences"
        description={
          canChangeCurrency
            ? `${defaultCurrency} · tap to change`
            : `${defaultCurrency} · locked`
        }
        onClick={() => setIsOpen(true)}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Money preferences"
        description="Choose the default currency for your money records."
        width="md"
        isDismissDisabled={isPending}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label
              htmlFor="defaultCurrency"
              className="text-sm font-medium text-foreground"
            >
              Default currency
            </label>

            <select
              id="defaultCurrency"
              name="defaultCurrency"
              defaultValue={defaultCurrency}
              disabled={!canChangeCurrency || isPending}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {currencyOptions.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>

            {!canChangeCurrency && (
              <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                Currency is locked because you already have transactions or
                a non-zero account balance. Currency conversion and
                multi-currency accounts will come later.
              </p>
            )}
          </div>

          <ModalFormActions
            onCancel={() => setIsOpen(false)}
            isPending={isPending}
            isSubmitDisabled={!canChangeCurrency}
            submitLabel="Save currency"
            pendingLabel="Saving..."
          />
        </form>
      </Modal>
    </>
  );
}