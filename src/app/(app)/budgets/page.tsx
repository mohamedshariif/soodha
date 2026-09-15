import { PageHeader } from "@/components/ui/page-header";
import { AddBudgetModal } from "./add-budget-modal";
import { BudgetSummaryCards } from "./_components/budget-summary-cards";
import { BudgetList } from "./_components/budget-list";
import { formatMonthLabel, parseMonthInputToBudgetPeriod } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type BudgetsSearchParams = { month?: string };

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<BudgetsSearchParams>;
}) {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("You must be signed in.");

  const zero = BigInt(0);
  const filters = await searchParams;
  const { monthValue, periodStart, periodEnd } = parseMonthInputToBudgetPeriod(
    filters.month,
  );

  const expenseCategories = await prisma.category.findMany({
    where: {
      userId: appUser.id,
      type: "EXPENSE",
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  const budgets = await prisma.budget.findMany({
    where: {
      userId: appUser.id,
      period: "MONTHLY",
      periodStart,
      periodEnd,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  const budgetCategoryIds = budgets
    .map((budget) => budget.categoryId)
    .filter((categoryId): categoryId is string => Boolean(categoryId));

  const categoryTransactions =
    budgetCategoryIds.length > 0
      ? await prisma.transaction.findMany({
          where: {
            userId: appUser.id,
            type: "EXPENSE",
            status: "ACTIVE",
            deletedAt: null,
            categoryId: { in: budgetCategoryIds },
            transactionDate: { gte: periodStart, lte: periodEnd },
          },
          orderBy: { transactionDate: "desc" },
        })
      : [];

  const spentByCategory = new Map<string, bigint>();
  const transactionsByCategory = new Map<string, typeof categoryTransactions>();

  for (const transaction of categoryTransactions) {
    if (!transaction.categoryId) continue;

    spentByCategory.set(
      transaction.categoryId,
      (spentByCategory.get(transaction.categoryId) ?? zero) +
        transaction.amountMinor,
    );

    const existing = transactionsByCategory.get(transaction.categoryId) ?? [];
    existing.push(transaction);
    transactionsByCategory.set(transaction.categoryId, existing);
  }

  const totalBudgetMinor = budgets.reduce(
    (total, budget) => total + budget.limitAmountMinor,
    zero,
  );
  const totalSpentMinor = budgets.reduce((total, budget) => {
    if (!budget.categoryId) return total;
    return total + (spentByCategory.get(budget.categoryId) ?? zero);
  }, zero);

  const currency = budgets[0]?.currency ?? "USD";

  const budgetRows = budgets.map((budget) => ({
    budget,
    spentMinor: budget.categoryId
      ? (spentByCategory.get(budget.categoryId) ?? zero)
      : zero,
    transactions: budget.categoryId
      ? (transactionsByCategory.get(budget.categoryId) ?? [])
      : [],
  }));

  const expenseCategoryOptions = expenseCategories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Set monthly limits and compare them with your real expenses."
      >
        <AddBudgetModal
          expenseCategories={expenseCategoryOptions}
          currentMonth={monthValue}
        />
      </PageHeader>

        <BudgetSummaryCards
          totalBudgetMinor={totalBudgetMinor}
          totalSpentMinor={totalSpentMinor}
          currency={currency}
          monthValue={monthValue}
        />

      <BudgetList monthLabel={formatMonthLabel(monthValue)} rows={budgetRows} />
    </div>
  );
}
