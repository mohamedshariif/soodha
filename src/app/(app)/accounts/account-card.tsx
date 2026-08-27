"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Star, Trash2 } from "lucide-react";
import { setDefaultAccount, archiveAccount } from "./actions";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { getAccountTypeMeta, type AccountType } from "./account-visuals";
import { formatMoneyFromMinorUnits } from "@/lib/money";

type TransactionSummary = {
  id: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amountMinor: bigint;
  transactionDate: Date;
  description: string | null;
  category: { name: string } | null;
};

type Account = {
  id: string;
  name: string;
  type: AccountType;
  provider: string | null;
  currency: string;
  isDefault: boolean;
  openingBalanceMinor: bigint;
  currentBalanceMinor: bigint;
  _count: { transactions: number };
};

export function AccountCard({
  account,
  recentTransactions,
}: {
  account: Account;
  recentTransactions: TransactionSummary[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSettingDefault, startSetDefaultTransition] = useTransition();
  const [isArchiving, startArchiveTransition] = useTransition();
  const { showToast } = useToast();

  const meta = getAccountTypeMeta(account.type);
  const Icon = meta.icon;
  const isNegative = account.currentBalanceMinor < BigInt(0);

  function handleSetDefault() {
    const formData = new FormData();
    formData.set("accountId", account.id);

    startSetDefaultTransition(async () => {
      const result = await setDefaultAccount(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't set default",
          message: result.message,
        });
        return;
      }

      showToast({
        type: "success",
        title: "Default updated",
        message: result.message,
      });
    });
  }

  function handleConfirmArchive() {
    const formData = new FormData();
    formData.set("accountId", account.id);

    startArchiveTransition(async () => {
      const result = await archiveAccount(formData);

      if (!result.ok) {
        showToast({
          type: "error",
          title: "Couldn't remove account",
          message: result.message,
        });
        return;
      }

      setIsDeleteModalOpen(false);
      showToast({
        type: "success",
        title: "Account removed",
        message: result.message,
      });
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs cursor-pointer transition-all duration-300 hover:shadow-md">
      <div className="p-4">
        <div>
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="w-full flex flex-col">
              <p className="font-medium text-foreground">{account.name}</p>

              <p className="text-sm text-muted-foreground">
                {meta.label}
                {/* {account.provider ? ` · ${account.provider}` : ""} · {account.currency}
                {account.provider ? ` · ${account.provider}` : ""} */}
              </p>
            </div>

            <div>
              <div className="flex items-start gap-3">
                {!account.isDefault && (
                  <button
                    type="button"
                    onClick={handleSetDefault}
                    disabled={isSettingDefault}
                    className="text-xs w-20 font-medium rounded-full bg-muted px-2 py-0.5 text-primary hover:text-primary-hover disabled:opacity-50 cursor-pointer"
                  >
                    {isSettingDefault ? "Setting..." : "Set default"}
                  </button>
                )}

                {!account.isDefault && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {account.isDefault && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    Default
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <p
              className="text-2xl font-semibold"
              style={{ color: isNegative ? "#EF4444" : meta.color }}
            >
              {formatMoneyFromMinorUnits(
                account.currentBalanceMinor,
                account.currency,
              )}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Opening{" "}
              {formatMoneyFromMinorUnits(
                account.openingBalanceMinor,
                account.currency,
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded((current) => !current)}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {account._count.transactions} transaction
            {account._count.transactions === 1 ? "" : "s"} linked
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/40 p-4">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transactions yet for this account.
            </p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {transaction.category?.name ?? "Uncategorized"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                      }).format(transaction.transactionDate)}
                      {transaction.description
                        ? ` · ${transaction.description}`
                        : ""}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 font-medium ${
                      transaction.type === "INCOME"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatMoneyFromMinorUnits(
                      transaction.amountMinor,
                      account.currency,
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title={`Remove "${account.name}"?`}
        description="If this account has transaction history, it will be archived instead of permanently deleted."
        isPending={isArchiving}
        onConfirm={handleConfirmArchive}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
