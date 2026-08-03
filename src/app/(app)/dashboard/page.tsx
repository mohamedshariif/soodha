import Link from "next/link";
import {
  formatDateForDisplay,
  formatMonthLabel,
  getCurrentMonthInputValue,
  parseMonthInputToBudgetPeriod,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);
  const oneHundred = BigInt(100);

  const currentMonthValue = getCurrentMonthInputValue();
  const { periodStart, periodEnd } =
    parseMonthInputToBudgetPeriod(currentMonthValue);

  const [account, incomeTotal, expenseTotal, recentTransactions, budgets] =
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
            gte: periodStart,
            lte: periodEnd,
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
            gte: periodStart,
            lte: periodEnd,
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

      prisma.budget.findMany({
        where: {
          userId: appUser.id,
          period: "MONTHLY",
          periodStart,
          periodEnd,
          status: "ACTIVE",
          deletedAt: null,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

  const budgetCategoryIds = budgets
    .map((budget) => budget.categoryId)
    .filter((categoryId): categoryId is string => Boolean(categoryId));

  const expensesByCategory =
    budgetCategoryIds.length > 0
      ? await prisma.transaction.groupBy({
          by: ["categoryId"],
          where: {
            userId: appUser.id,
            type: "EXPENSE",
            status: "ACTIVE",
            deletedAt: null,
            categoryId: {
              in: budgetCategoryIds,
            },
            transactionDate: {
              gte: periodStart,
              lte: periodEnd,
            },
          },
          _sum: {
            amountMinor: true,
          },
        })
      : [];

  const spentByCategory = new Map<string, bigint>();

  expensesByCategory.forEach((item) => {
    if (item.categoryId) {
      spentByCategory.set(item.categoryId, item._sum?.amountMinor ?? zero);
    }
  });

  const incomeTotalMinor = incomeTotal._sum.amountMinor ?? zero;
  const expenseTotalMinor = expenseTotal._sum.amountMinor ?? zero;
  const balanceMinor = account?.currentBalanceMinor ?? zero;
  const currency = account?.currency ?? budgets[0]?.currency ?? "USD";

  const budgetHealthItems = budgets.map((budget) => {
    const spentMinor = budget.categoryId
      ? spentByCategory.get(budget.categoryId) ?? zero
      : zero;

    const remainingMinor = budget.limitAmountMinor - spentMinor;

    const progressPercent =
      budget.limitAmountMinor > zero
        ? Number((spentMinor * oneHundred) / budget.limitAmountMinor)
        : 0;

    return {
      id: budget.id,
      categoryName: budget.category?.name ?? "Deleted category",
      currency: budget.currency,
      limitAmountMinor: budget.limitAmountMinor,
      spentMinor,
      remainingMinor,
      progressPercent,
      alertThresholdPercent: budget.alertThresholdPercent,
    };
  });

  const totalBudgetMinor = budgetHealthItems.reduce((total, budget) => {
    return total + budget.limitAmountMinor;
  }, zero);

  const totalBudgetSpentMinor = budgetHealthItems.reduce((total, budget) => {
    return total + budget.spentMinor;
  }, zero);

  const totalBudgetRemainingMinor =
    totalBudgetMinor - totalBudgetSpentMinor;

  const budgetProgressPercent =
    totalBudgetMinor > zero
      ? Number((totalBudgetSpentMinor * oneHundred) / totalBudgetMinor)
      : 0;

  const budgetProgressWidth = Math.min(budgetProgressPercent, 100);

  const riskyBudgetItems = budgetHealthItems
    .filter((budget) => budget.progressPercent >= budget.alertThresholdPercent)
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, 3);

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">Budget health</h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatMonthLabel(currentMonthValue)}
            </p>
          </div>

          <Link
            href={`/budgets?month=${currentMonthValue}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View budgets
          </Link>
        </div>

        {budgets.length === 0 ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              No budgets created for this month yet.
            </p>

            <Link
              href={`/budgets?month=${currentMonthValue}`}
              className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Create a budget
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-col justify-between gap-4 rounded-lg bg-slate-50 p-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm text-slate-500">Overall budget use</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {formatMoneyFromMinorUnits(
                    totalBudgetSpentMinor,
                    currency
                  )}{" "}
                  spent of{" "}
                  {formatMoneyFromMinorUnits(totalBudgetMinor, currency)}
                </p>
              </div>

              <div className="md:text-right">
                <p
                  className={`text-sm font-semibold ${
                    totalBudgetRemainingMinor >= zero
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {totalBudgetRemainingMinor >= zero
                    ? "Remaining "
                    : "Over budget "}
                  {formatMoneyFromMinorUnits(
                    totalBudgetRemainingMinor >= zero
                      ? totalBudgetRemainingMinor
                      : -totalBudgetRemainingMinor,
                    currency
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {budgetProgressPercent}% used
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  budgetProgressPercent >= 100
                    ? "bg-red-600"
                    : budgetProgressPercent >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                }`}
                style={{ width: `${budgetProgressWidth}%` }}
              />
            </div>

            <div className="mt-4">
              {riskyBudgetItems.length === 0 ? (
                <p className="text-sm text-emerald-700">
                  All budgets are on track.
                </p>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Needs attention
                  </p>

                  <div className="mt-2 space-y-2">
                    {riskyBudgetItems.map((budget) => (
                      <div
                        key={budget.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {budget.categoryName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatMoneyFromMinorUnits(
                              budget.spentMinor,
                              budget.currency
                            )}{" "}
                            spent of{" "}
                            {formatMoneyFromMinorUnits(
                              budget.limitAmountMinor,
                              budget.currency
                            )}
                          </p>
                        </div>

                        <p
                          className={`text-sm font-semibold ${
                            budget.progressPercent >= 100
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {budget.progressPercent}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Recent transactions
          </h2>

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
                      {formatDateForDisplay(transaction.transactionDate)}
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
  valueClassName = "text-slate-900",
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