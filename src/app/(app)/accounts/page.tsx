import { Banknote, Landmark, Smartphone, Wallet } from "lucide-react";
import { AddAccountModal } from "./add-account-modal";
import { AccountCard } from "./account-card";
import type { AccountType } from "./account-visuals";
import { EmptyState } from "@/components/ui/empty-state";
import { SummaryCard } from "@/components/ui/summary-card";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RECENT_TRANSACTIONS_PER_ACCOUNT = 5;

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

  const recentTransactionsEntries = await Promise.all(
    accounts.map(async (account) => {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: appUser.id,
          accountId: account.id,
          status: "ACTIVE",
          deletedAt: null,
        },
        include: {
          category: { select: { name: true } },
        },
        orderBy: { transactionDate: "desc" },
        take: RECENT_TRANSACTIONS_PER_ACCOUNT,
      });

      return [account.id, transactions] as const;
    }),
  );

  const recentTransactionsByAccount = new Map(recentTransactionsEntries);

  const totalBalanceMinor = accounts.reduce((total, account) => {
    return total + account.currentBalanceMinor;
  }, zero);

  const totalsByType = accounts.reduce(
    (totals, account) => {
      const key = account.type as AccountType;
      totals[key] = (totals[key] ?? zero) + account.currentBalanceMinor;
      return totals;
    },
    {} as Record<AccountType, bigint>,
  );

  const defaultAccount = accounts.find((account) => account.isDefault);
  const currency =
    defaultAccount?.currency ??
    appUser.preferences?.defaultCurrency ??
    accounts[0]?.currency ??
    "USD";

  return (
    <div>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 lg:gap-3">
        <SummaryCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total balance"
          value={formatMoneyFromMinorUnits(totalBalanceMinor, currency)}
          helper={`${accounts.length} active account${accounts.length === 1 ? "" : "s"}`}
          valueClassName={
            totalBalanceMinor >= zero ? "text-white" : "text-red-300"
          }
          className="bg-linear-to-br from-indigo-400 via-indigo-600 to-indigo-700"
          labelClassName="text-indigo-100/80"
          helperClassName="text-white/80"
          iconClassName="bg-indigo-100/20 text-white/80"
        />

        <SummaryCard
          icon={<Wallet className="h-5 w-5" />}
          label="Total cash"
          value={formatMoneyFromMinorUnits(totalsByType.CASH ?? zero, currency)}
          valueClassName="text-amber-600"
        />

        <SummaryCard
          icon={<Landmark className="h-5 w-5" />}
          label="Total bank"
          value={formatMoneyFromMinorUnits(totalsByType.BANK ?? zero, currency)}
          valueClassName="text-blue-600"
        />

        <SummaryCard
          icon={<Smartphone className="h-5 w-5" />}
          label="Total mobile money"
          value={formatMoneyFromMinorUnits(
            totalsByType.MOBILE_MONEY ?? zero,
            currency,
          )}
          valueClassName="text-primary"
        />
      </div>

      <section className="mt-5">
        <div className="flex items-center justify-between ">
          <h2 className="font-semibold text-foreground">Active accounts</h2>
          <AddAccountModal />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-3 md:grid-cols-2">
          {accounts.length === 0 ? (
            <EmptyState description="No accounts found. Add your first account to start tracking money." />
          ) : (
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                recentTransactions={
                  recentTransactionsByAccount.get(account.id) ?? []
                }
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
