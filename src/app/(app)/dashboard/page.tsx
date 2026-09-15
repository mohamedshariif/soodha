import {
  addDaysUtc,
  formatMonthLabel,
  getTodayDateInputValue,
  isMonthInputValue,
  parseDateInputToTransactionDate,
  parseMonthInputToBudgetPeriod,
} from "@/lib/date";
import { computeBudgetProgress } from "@/lib/budgets";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { getFourWeekBuckets } from "@/lib/weekly-buckets";
import { prisma } from "@/lib/prisma";
import { DashboardActivity } from "./_components/dashboard-activity";
import { DashboardOverview } from "./_components/dashboard-overview";
import { DashboardBill } from "./_components/dashboard-bill";
import { DashboardBudget } from "./_components/dashboard-budget";
import { DashboardSavings } from "./_components/dashboard-savings";

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

  const params = await searchParams;
  const selectedMonthValue = isMonthInputValue(params.month)
    ? params.month
    : undefined;
  const { monthValue, periodStart, periodEnd } =
    parseMonthInputToBudgetPeriod(selectedMonthValue);
  const todayInput = getTodayDateInputValue();
  const today = parseDateInputToTransactionDate(todayInput);
  const billAttentionEnd = addDaysUtc(today, 7);
  const zero = BigInt(0);

  const [
    accounts,
    incomeCategories,
    expenseCategories,
    incomeTotal,
    expenseTotal,
    recentTransactions,
    budgets,
    billsNeedingAttention,
    savingsTotalsResult,
    monthlyTransactions,
  ] = await Promise.all([
    prisma.account.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        type: true,
        currency: true,
        currentBalanceMinor: true,
        isDefault: true,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.category.findMany({
      where: {
        userId: appUser.id,
        type: "INCOME",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true, name: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      where: {
        userId: appUser.id,
        type: "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true, name: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.transaction.aggregate({
      where: {
        userId: appUser.id,
        type: "INCOME",
        status: "ACTIVE",
        deletedAt: null,
        transactionDate: { gte: periodStart, lte: periodEnd },
      },
      _sum: { amountMinor: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: appUser.id,
        type: "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
        transactionDate: { gte: periodStart, lte: periodEnd },
      },
      _sum: { amountMinor: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      select: {
        id: true,
        type: true,
        amountMinor: true,
        currency: true,
        transactionDate: true,
        description: true,
        category: { select: { name: true, icon: true } },
        account: { select: { name: true } },
      },
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
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
      select: {
        id: true,
        categoryId: true,
        name: true,
        limitAmountMinor: true,
        currency: true,
        alertThresholdPercent: true,
        category: { select: { name: true, icon: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.bill.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
        nextDueDate: { lte: billAttentionEnd },
      },
      select: {
        id: true,
        name: true,
        amountMinor: true,
        currency: true,
        nextDueDate: true,
        category: { select: { name: true } },
      },
      orderBy: { nextDueDate: "asc" },
      take: 5,
    }),
    prisma.savingsGoal.aggregate({
      where: {
        userId: appUser.id,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
        deletedAt: null,
      },
      _sum: { targetAmountMinor: true, currentAmountMinor: true },
    }),
    prisma.transaction.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
        type: { in: ["INCOME", "EXPENSE"] },
        transactionDate: { gte: periodStart, lte: periodEnd },
      },
      select: { type: true, amountMinor: true, transactionDate: true },
    }),
  ]);

  const budgetCategoryIds = budgets
    .map((budget) => budget.categoryId)
    .filter((categoryId): categoryId is string => Boolean(categoryId));
  const expensesByCategory = budgetCategoryIds.length
    ? await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId: appUser.id,
          type: "EXPENSE",
          status: "ACTIVE",
          deletedAt: null,
          categoryId: { in: budgetCategoryIds },
          transactionDate: { gte: periodStart, lte: periodEnd },
        },
        _sum: { amountMinor: true },
      })
    : [];

  const spentByCategory = new Map<string, bigint>();
  for (const expense of expensesByCategory) {
    if (expense.categoryId) {
      spentByCategory.set(expense.categoryId, expense._sum.amountMinor ?? zero);
    }
  }
  const incomeCount = monthlyTransactions.filter((t) => t.type === "INCOME").length;
  const expenseCount = monthlyTransactions.filter((t) => t.type === "EXPENSE").length;
  const totalBalanceMinor = accounts.reduce(
    (total, account) => total + account.currentBalanceMinor,
    zero,
  );
  const incomeMinor = incomeTotal._sum.amountMinor ?? zero;
  const expenseMinor = expenseTotal._sum.amountMinor ?? zero;
  const defaultAccount = accounts.find((account) => account.isDefault);
  const currency =
    defaultAccount?.currency ??
    accounts[0]?.currency ??
    budgets[0]?.currency ??
    billsNeedingAttention[0]?.currency ??
    appUser.preferences?.defaultCurrency ??
    "USD";

  const chartData = getFourWeekBuckets(periodStart, periodEnd).map((bucket) => {
    let income = 0;
    let expense = 0;

    for (const transaction of monthlyTransactions) {
      if (
        transaction.transactionDate >= bucket.start &&
        transaction.transactionDate <= bucket.end
      ) {
        if (transaction.type === "INCOME") {
          income += Number(transaction.amountMinor);
        } else {
          expense += Number(transaction.amountMinor);
        }
      }
    }

    return {
      week: bucket.weekLabel,
      income: income / 100,
      expense: expense / 100,
    };
  });

  const budgetProgress = budgets.map((budget) => {
    const spentMinor = budget.categoryId
      ? (spentByCategory.get(budget.categoryId) ?? zero)
      : zero;
    const progress = computeBudgetProgress(
      budget.limitAmountMinor,
      spentMinor,
      budget.alertThresholdPercent,
    );

    return {
      id: budget.id,
      name: budget.category?.name ?? budget.name,
      icon: budget.category?.icon ?? null,
      spentMinor,
      limitMinor: budget.limitAmountMinor,
      currency: budget.currency,
      progressWidth: progress.progressWidth,
      progressBarClassName: progress.progressBarClassName,
    };
  });

  const totalTargetMinor =
    savingsTotalsResult._sum.targetAmountMinor ?? BigInt(0);
  const totalSavedMinor =
    savingsTotalsResult._sum.currentAmountMinor ?? BigInt(0);
  const overallProgressPercent =
    totalTargetMinor > zero
      ? Number((totalSavedMinor * BigInt(100)) / totalTargetMinor)
      : 0;

  return (
    <div>
      <DashboardOverview
        currency={currency}
        totalBalanceMinor={totalBalanceMinor}
        incomeMinor={incomeMinor}
        incomeCount={incomeCount}
        expenseMinor={expenseMinor}
        expenseCount={expenseCount}
        accountCount={accounts.length}
        monthLabel={formatMonthLabel(monthValue)}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        accounts={accounts}
        today={todayInput}
      />

      <DashboardActivity
        currency={currency}
        chartData={chartData}
        recentTransactions={recentTransactions}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashboardBill bills={billsNeedingAttention} today={today} />

        <div className="grid grid-cols-1 gap-4">
          <DashboardBudget budgets={budgetProgress} monthValue={monthValue} />
          <DashboardSavings
            totalTargetMinor={totalTargetMinor}
            totalSavedMinor={totalSavedMinor}
            overallProgressPercent={overallProgressPercent}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}
