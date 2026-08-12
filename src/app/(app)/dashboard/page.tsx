import Link from "next/link";
import {
  addDaysUtc,
  formatDateForDisplay,
  formatMonthLabel,
  //getCurrentMonthInputValue,
  getTodayDateInputValue,
  isMonthInputValue,
  parseDateInputToTransactionDate,
  parseMonthInputToBudgetPeriod,
} from "@/lib/date";
import { DashboardIncomeExpenseChart } from "@/components/finance-charts";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { SummaryCard } from "@/components/ui/summary-card";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { MonthSelector } from "@/components/month-selector";
import { TimeGreeting } from "@/components/time-greeting";
import {
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
//import { SummaryCard } from "@/components/summaryCard";

export const dynamic = "force-dynamic";

type DashboardSearchParams = {
  month?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);
  const oneHundred = BigInt(100);

  /* const currentMonthValue = getCurrentMonthInputValue();
  const { periodStart, periodEnd } =
    parseMonthInputToBudgetPeriod(currentMonthValue); */
  const params = await searchParams;

  const selectedMonthValue = isMonthInputValue(params.month)
    ? params.month
    : undefined;
  const {
    monthValue: currentMonthValue,
    periodStart,
    periodEnd,
  } = parseMonthInputToBudgetPeriod(selectedMonthValue);

  const [
    account, 
    incomeTotal, 
    expenseTotal, 
    recentTransactions, 
    budgets, 
    activeBills, 
    billPaymentsThisMonth, 
    savingsGoals,
    debts,
    debtPaymentsThisMonth,
  ] =
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

      prisma.bill.findMany({
            where: {
              userId: appUser.id,
              status: "ACTIVE",
              deletedAt: null,
            },
            include: {
              category: true,
            },
            orderBy: {
              nextDueDate: "asc",
            },
          }),

      prisma.billPayment.findMany({
        where: {
          userId: appUser.id,
          dueDate: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
      }),

      prisma.savingsGoal.findMany({
        where: {
          userId: appUser.id,
          status: {
            in: ["ACTIVE", "COMPLETED"],
          },
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.debt.findMany({
        where: {
          userId: appUser.id,
          status: {
            in: ["ACTIVE", "PAID_OFF"],
          },
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.debtPayment.findMany({
        where: {
          userId: appUser.id,
          paidAt: {
            gte: periodStart,
            lte: periodEnd,
          },
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
  const currency = 
    account?.currency ?? 
    budgets[0]?.currency ??
    activeBills[0]?.currency ??
    savingsGoals[0]?.currency ??
    debts[0]?.currency ?? 
    "USD";

  const dashboardIncomeExpenseChartData = [
    {
      name: "Income",
      amount: Number(incomeTotalMinor) / 100,
    },
    {
      name: "Expenses",
      amount: Number(expenseTotalMinor) / 100,
    },
  ];

  const todayInputValue = getTodayDateInputValue();
  const todayDate = parseDateInputToTransactionDate(todayInputValue);
  const billsAttentionEndDate = addDaysUtc(todayDate, 7);

  const billsNeedingAttention = activeBills.filter((bill) => {
    return bill.nextDueDate.getTime() <= billsAttentionEndDate.getTime();
  });

  const remainingBillsThisMonth = activeBills.filter((bill) => {
    return (
      bill.nextDueDate.getTime() >= periodStart.getTime() &&
      bill.nextDueDate.getTime() <= periodEnd.getTime()
    );
  });

  const dueSoonBillsTotalMinor = billsNeedingAttention.reduce((total, bill) => {
    return total + bill.amountMinor
  }, zero);

  const paidBillsThisMonthMinor = billPaymentsThisMonth.reduce(
    (total, payment) => {
      return total + payment.amountMinor;
    },
    zero
  );

  const remainingBillsThisMonthMinor = remainingBillsThisMonth.reduce(
    (total, bill) => {
      return total + bill.amountMinor;
    },
    zero
  );
  
  // Savings goal management
  const activeSavingsGoals = savingsGoals.filter((goal) => {
    return goal.status === "ACTIVE";
  });

  const completedSavingsGoals = savingsGoals.filter((goal) => {
    return goal.status === "COMPLETED";
  });

  const totalSavingsTargetMinor = savingsGoals.reduce((total, goal) => {
    return total + goal.targetAmountMinor;
  }, zero);

  const totalSavedMinor = savingsGoals.reduce((total, goal) => {
    return total + goal.currentAmountMinor;
  }, zero);

  const totalSavingsRemainingMinor = savingsGoals.reduce((total, goal) => {
    const remaining = goal.targetAmountMinor - goal.currentAmountMinor;
    
    return total + (remaining > zero ? remaining : zero);
  }, zero);

  const savingsProgressPercent = 
    totalSavingsTargetMinor > zero
      ? Number((totalSavedMinor * oneHundred) / totalSavingsTargetMinor)
      : 0;

  const savingsProgressWidth = Math.min(savingsProgressPercent, 100);

  const nextSavingsGoal = activeSavingsGoals.map((goal) => {
    const remaining = goal.targetAmountMinor - goal.currentAmountMinor;

    const progressPercent = goal.targetAmountMinor > zero
      ? Number((goal.currentAmountMinor * oneHundred) / goal.targetAmountMinor)
      : 0;

    return {
      id: goal.id,
      name: goal.name,
      currency: goal.currency,
      currentAmountMinor : goal.currentAmountMinor,
      targetAmountMinor: goal.targetAmountMinor,
      remainingMinor: remaining > zero ? remaining : zero,
      progressPercent,
    };
  })
  .sort((a, b) => b.progressPercent - a.progressPercent)[0];

  //Budget Management

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

  // Debts management
  const activeDebts = debts.filter((debt) => {
    return debt.status === "ACTIVE";
  });

  const paidOffDebts = debts.filter((debt) => {
    return debt.status === "PAID_OFF";
  });

  const totalDebtOriginalMinor = debts.reduce((total, debt) => {
    return total + debt.originalAmountMinor;
  }, zero);

  const totalDebtRemainingMinor = activeDebts.reduce((total, debt) => {
    return total + debt.remainingAmountMinor;
  }, zero);

  const totalDebtPaidMinor = debts.reduce((total, debt) => {
    return total + (debt.originalAmountMinor - debt.remainingAmountMinor);
  }, zero);

  const debtPaymentsThisMonthMinor = debtPaymentsThisMonth.reduce((total, payment) => {
    return total + payment.amountMinor;
  }, zero);

  const minimumDebtPaymentsMinor = activeDebts.reduce((total, debt) => {
    return total + (debt.minimumPaymentMinor ?? zero);
  }, zero);

  const debtPayoffProgressPercent = totalDebtOriginalMinor > zero
    ? Number((totalDebtPaidMinor * oneHundred) / totalDebtOriginalMinor)
    : 0;

  const debtPayoffProgressWidth = Math.min(debtPayoffProgressPercent, 100);

  const highestRemainingDebt = activeDebts.map((debt) => {
    const paidMinor = debt.originalAmountMinor - debt.remainingAmountMinor;

    const progressPercent = debt.originalAmountMinor > zero
    ? Number((paidMinor * oneHundred) / debt.originalAmountMinor)
    : 0;

    return {
      id: debt.id,
      name: debt.name,
      currency: debt.currency,
      remainingAmountMinor: debt.remainingAmountMinor,
      originalAmountMinor: debt.originalAmountMinor,
      progressPercent,
    };
  })
  .sort((a, b) => {
    if (a.remainingAmountMinor < b.remainingAmountMinor) return 1;
    if (a.remainingAmountMinor > b.remainingAmountMinor) return -1;
    return 0;
  })[0];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            <TimeGreeting name={appUser.profile?.fullName ?? "there"} />
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Here is your money overview
          </p>
        </div>

        <MonthSelector value={currentMonthValue}/>

        {/* <div className="flex gap-2">
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
        </div> */}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Income"
          value={formatMoneyFromMinorUnits(incomeTotalMinor, currency)}
          helper={`For ${formatMonthLabel(currentMonthValue)}`}
          valueClassName="text-emerald-600"
        />

        <SummaryCard
          icon={<TrendingDown className="h-5 w-5" />}
          label="Expenses"
          value={formatMoneyFromMinorUnits(expenseTotalMinor, currency)}
          helper={`For ${formatMonthLabel(currentMonthValue)}`}
          valueClassName="text-red-600"
        />

        <SummaryCard
          icon={<WalletCards className="h-5 w-5" />}
          label="Current balance"
          value={
            account
              ? formatMoneyFromMinorUnits(account.currentBalanceMinor, account.currency)
              : formatMoneyFromMinorUnits(BigInt(0), currency)
          }
          helper="Default account balance"
        />
      </div>

      {/* <div className="mt-6 grid gap-4 md:grid-cols-3">
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
      </div> */}

      {/* <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">Income vs expenses</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick comparison for {formatMonthLabel(currentMonthValue)}.
            </p>
          </div>
        </div>

        <div className="mt-4 h-72">
          <DashboardIncomeExpenseChart
            data={dashboardIncomeExpenseChartData}
            currency={currency}
          />
        </div>
      </section> */}
      <SectionCard
        className="mt-6"
        title="Income vs expenses"
        description={`Quick comparison for ${formatMonthLabel(currentMonthValue)}.`}
      >
        <div className="mt-4 h-72">
          <DashboardIncomeExpenseChart
            data={dashboardIncomeExpenseChartData}
            currency={currency}
          />
        </div>
      </SectionCard>

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Bills snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quick view for {formatMonthLabel(currentMonthValue)}
          </p>
        </div>

        <Link
          href="/bills"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          View bills
        </Link>
      </div>

      {activeBills.length === 0 && billPaymentsThisMonth.length === 0 ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            No bills tracked yet.
          </p>
          <Link
            href="/bills"
            className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Add a bill
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Due soon</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">
                {formatMoneyFromMinorUnits(dueSoonBillsTotalMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {billsNeedingAttention.length} bill
                {billsNeedingAttention.length === 1 ? "" : "s"} need attention
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Remaining this month</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatMoneyFromMinorUnits(
                  remainingBillsThisMonthMinor,
                  currency
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {remainingBillsThisMonth.length} unpaid bill due this month
                {remainingBillsThisMonth.length === 1 ? "" : "s"}
              </p>
            </div>
            {/* <SummaryCard
                        label="Remaining this month"
                        value={formatMoneyFromMinorUnits(
                          remainingBillsThisMonthMinor,
                          currency
                        )}
                        helper={`${remainingBillsThisMonth.length} unpaid bill${
                          remainingBillsThisMonth.length === 1 ? "" : "s"
                        } due this month`}
                        valueClassName={
                          remainingBillsThisMonth.length > 0
                            ? "text-amber-600"
                            : "text-slate-900"
                        }
                      /> */}

            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Paid this month</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {formatMoneyFromMinorUnits(paidBillsThisMonthMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {billPaymentsThisMonth.length} payment
                {billPaymentsThisMonth.length === 1 ? "" : "s"} recorded
              </p>
            </div>
          </div>

          {billsNeedingAttention.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-slate-900">
                Bills needing attention
              </p>

              {billsNeedingAttention.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {bill.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Due {formatDateForDisplay(bill.nextDueDate)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoneyFromMinorUnits(bill.amountMinor, bill.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>

    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Savings snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quick view of your savings progress.
          </p>
        </div>

        <Link
          href="/savings"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          View savings
        </Link>
      </div>

      {savingsGoals.length === 0 ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            No savings goals created yet.
          </p>

          <Link
            href="/savings"
            className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Create a savings goal
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Saved so far</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {formatMoneyFromMinorUnits(totalSavedMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {completedSavingsGoals.length} completed goal
                {completedSavingsGoals.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Remaining</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">
                {formatMoneyFromMinorUnits(totalSavingsRemainingMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {activeSavingsGoals.length} active goal
                {activeSavingsGoals.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Overall progress</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {savingsProgressPercent}%
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across {savingsGoals.length} goal
                {savingsGoals.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${savingsProgressWidth}%` }}
            />
          </div>

          {nextSavingsGoal && (
            <div className="mt-4 rounded-lg border border-slate-200 px-3 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Closest active goal
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {nextSavingsGoal.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {nextSavingsGoal.progressPercent}%
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatMoneyFromMinorUnits(
                      nextSavingsGoal.remainingMinor,
                      nextSavingsGoal.currency
                    )}{" "}
                    remaining
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>

    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Debt snapshot</h2>
          <p className="mt-1 text-sm text-slate-500">
            Quick view of what you owe and paid this month.
          </p>
        </div>

        <Link
          href="/debts"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          View debts
        </Link>
      </div>

      {debts.length === 0 ? (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-600">No debts tracked yet.</p>

          <Link
            href="/debts"
            className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Add a debt
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">Remaining debt</p>
              <p className="mt-1 text-lg font-semibold text-red-700">
                {formatMoneyFromMinorUnits(totalDebtRemainingMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-red-700">
                {activeDebts.length} active debt
                {activeDebts.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Paid this month</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {formatMoneyFromMinorUnits(debtPaymentsThisMonthMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {debtPaymentsThisMonth.length} payment
                {debtPaymentsThisMonth.length === 1 ? "" : "s"} recorded
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Minimum payments</p>
              <p className="mt-1 text-lg font-semibold text-amber-700">
                {formatMoneyFromMinorUnits(minimumDebtPaymentsMinor, currency)}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {paidOffDebts.length} paid off debt
                {paidOffDebts.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <p className="text-slate-600">Overall payoff progress</p>
              <p className="font-medium text-slate-900">
                {debtPayoffProgressPercent}%
              </p>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${debtPayoffProgressWidth}%` }}
              />
            </div>
          </div>

          {highestRemainingDebt && (
            <div className="mt-4 rounded-lg border border-slate-200 px-3 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Highest remaining debt
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {highestRemainingDebt.name}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-red-600">
                    {formatMoneyFromMinorUnits(
                      highestRemainingDebt.remainingAmountMinor,
                      highestRemainingDebt.currency
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {highestRemainingDebt.progressPercent}% paid
                  </p>
                </div>
              </div>
            </div>
          )}
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