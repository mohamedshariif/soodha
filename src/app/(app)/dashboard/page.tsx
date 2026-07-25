import Link from "next/link";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [account, incomeTotal, expenseTotal, recentTransactions] =
    await Promise.all([
      prisma.account.findFirst({
        where: {
          userId: appUser.id,
          isDefault: true,
          status: "ACTIVE",
          deletedAt: null,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          userId: appUser.id,
          type: "INCOME",
          status: "ACTIVE",
          deletedAt: null,
          transactionDate: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amountMinor: true,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          userId: appUser.id,
          type: "EXPENSE",
          status: "ACTIVE",
          deletedAt: null,
          transactionDate: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amountMinor: true,
        },
      }),

      prisma.transaction.findMany({
        where: {
          userId: appUser.id,
          status: "ACTIVE",
          deletedAt: null,
        },
        include: {
          category: true,
          account: true,
        },
        orderBy: {
          transactionDate: "desc",
        },
        take: 5,
      }),
    ]);

  const incomeTotalMinor = incomeTotal._sum.amountMinor ?? 0n;
  const expenseTotalMinor = expenseTotal._sum.amountMinor ?? 0n;
  const balanceMinor = account?.currentBalanceMinor ?? 0n;
  const currency = account?.currency ?? "USD";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome to Soodha, {appUser.profile?.fullName}.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/income"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Add income
          </Link>

          <Link
            href="/expenses"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Add expense
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DashboardCard
          label="Income this month"
          value={formatMoneyFromMinorUnits(incomeTotalMinor, currency)}
          valueClassName="text-emerald-600"
        />

        <DashboardCard
          label="Expenses this month"
          value={formatMoneyFromMinorUnits(expenseTotalMinor, currency)}
          valueClassName="text-red-600"
        />

        <DashboardCard
          label="Current balance"
          value={formatMoneyFromMinorUnits(balanceMinor, currency)}
          valueClassName="text-slate-900"
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent transactions</h2>

          <Link
            href="/transactions"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          ) : (
            recentTransactions.map((transaction) => {
              const isIncome = transaction.type === "INCOME";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.description}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.category?.name ?? "No category"} ·{" "}
                      {transaction.account.name} ·{" "}
                      {transaction.transactionDate.toDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isIncome ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatMoneyFromMinorUnits(
                        transaction.amountMinor,
                        transaction.currency
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function DashboardCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}