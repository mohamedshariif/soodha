import {
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  MoreHorizontal,
  Smartphone,
  Star,
  Wallet,
} from "lucide-react";
import { AddAccountModal } from "./add-account-modal";
import { archiveAccount, setDefaultAccount } from "./actions";
import { EmptyState } from "@/components/ui/empty-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatAccountType(type: string) {
  switch (type) {
    case "CASH":
      return "Cash";
    case "BANK":
      return "Bank";
    case "MOBILE_MONEY":
      return "Mobile money";
    case "CARD":
      return "Card";
    default:
      return "Other";
  }
}

function AccountTypeIcon({ type }: { type: string }) {
  const className = "h-5 w-5";

  switch (type) {
    case "CASH":
      return <Wallet className={className} />;
    case "BANK":
      return <Landmark className={className} />;
    case "MOBILE_MONEY":
      return <Smartphone className={className} />;
    case "CARD":
      return <CreditCard className={className} />;
    default:
      return <MoreHorizontal className={className} />;
  }
}

export default async function AccountsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);

  const accounts = await prisma.account.findMany({
    where: {
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const totalBalanceMinor = accounts.reduce((total, account) => {
    return total + account.currentBalanceMinor;
  }, zero);

  const totalOpeningBalanceMinor = accounts.reduce((total, account) => {
    return total + account.openingBalanceMinor;
  }, zero);

  const defaultAccount = accounts.find((account) => account.isDefault);
  const currency =
    defaultAccount?.currency ??
    appUser.preferences?.defaultCurrency ??
    accounts[0]?.currency ??
    "USD";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="mt-2 text-slate-600">
            Manage where your money is tracked in Soodha.
          </p>
        </div>

        <AddAccountModal />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total balance"
          value={formatMoneyFromMinorUnits(totalBalanceMinor, currency)}
          helper={`${accounts.length} active account${
            accounts.length === 1 ? "" : "s"
          }`}
          valueClassName={
            totalBalanceMinor >= zero ? "text-emerald-600" : "text-red-600"
          }
        />

        <SummaryCard
          icon={<Star className="h-5 w-5" />}
          label="Default account"
          value={defaultAccount?.name ?? "None"}
          helper={
            defaultAccount
              ? `${formatAccountType(defaultAccount.type)} · ${
                  defaultAccount.currency
                }`
              : "Create or select a default account"
          }
        />

        <SummaryCard
          icon={<Building2 className="h-5 w-5" />}
          label="Opening balances"
          value={formatMoneyFromMinorUnits(totalOpeningBalanceMinor, currency)}
          helper="Starting money across active accounts"
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Active accounts</h2>
          <p className="text-sm text-slate-500">
            {accounts.length} account{accounts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {accounts.length === 0 ? (
            <EmptyState description="No accounts found. Add your first account to start tracking money." />
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        account.isDefault
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <AccountTypeIcon type={account.type} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {account.name}
                        </p>

                        {account.isDefault && (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatAccountType(account.type)} · {account.currency}
                      </p>

                      {account.provider && (
                        <p className="mt-1 text-sm text-slate-500">
                          Provider: {account.provider}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-500">
                        {account._count.transactions} transaction
                        {account._count.transactions === 1 ? "" : "s"} linked
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p
                      className={`text-lg font-semibold ${
                        account.currentBalanceMinor >= zero
                          ? "text-slate-900"
                          : "text-red-600"
                      }`}
                    >
                      {formatMoneyFromMinorUnits(
                        account.currentBalanceMinor,
                        account.currency
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Opening{" "}
                      {formatMoneyFromMinorUnits(
                        account.openingBalanceMinor,
                        account.currency
                      )}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-start gap-3 md:justify-end">
                      {!account.isDefault && (
                        <form action={setDefaultAccount}>
                          <input
                            type="hidden"
                            name="accountId"
                            value={account.id}
                          />
                          <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                            Set default
                          </button>
                        </form>
                      )}

                      {!account.isDefault && (
                        <form action={archiveAccount}>
                          <input
                            type="hidden"
                            name="accountId"
                            value={account.id}
                          />
                          <button className="text-xs font-medium text-red-600 hover:text-red-700">
                            Archive
                          </button>
                        </form>
                      )}

                      {account.isDefault && (
                        <p className="text-xs text-slate-500">
                          Used by new records
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}