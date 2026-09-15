"use client";

import { useState, useTransition } from "react";
import { WalletCards } from "lucide-react";
import { SettingsCard } from "./settings-card";
import { useToast } from "@/components/ui/toast-provider";
import { updateDefaultCurrency } from "../actions";
import { X } from "lucide-react";

type CurrencyOption = { value: string; label: string };

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
        showToast({ type: "error", title: "Couldn't update currency", message: result.message });
        return;
      }

      setIsOpen(false);
      showToast({ type: "success", title: "Currency updated", message: result.message });
    });
  }

  return (
    <>
      <SettingsCard
        icon={WalletCards}
        title="Money preferences"
        description={canChangeCurrency ? `${defaultCurrency} · tap to change` : `${defaultCurrency} · locked`}
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-card shadow-xl">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <h2 className="font-semibold text-foreground">Money preferences</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose the default currency for your money records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="text-sm font-medium text-foreground">Default currency</label>
                <select
                  name="defaultCurrency"
                  defaultValue={defaultCurrency}
                  disabled={!canChangeCurrency}
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
                    Currency is locked because you already have transactions or a non-zero account balance.
                    Currency conversion and multi-currency accounts will come later.
                  </p>
                )}
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
                  disabled={!canChangeCurrency || isPending}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save currency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}