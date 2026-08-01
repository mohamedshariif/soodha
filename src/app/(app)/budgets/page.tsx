import { archiveBudget, createOrUpdateBudget } from "./actions";
import { BudgetMonthPicker } from "./budget-month-picker";
import {
  formatMonthLabel,
  parseMonthInputToBudgetPeriod,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type BudgetsSearchParams = {
  month?: string;
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<BudgetsSearchParams>;
}) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);
  const oneHundred = BigInt(100);

  const filters = await searchParams;

  const { monthValue, periodStart, periodEnd } = parseMonthInputToBudgetPeriod(
    filters.month
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
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

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

  const totalBudgetMinor = budgets.reduce((total, budget) => {
    return total + budget.limitAmountMinor;
  }, zero);

  const totalSpentMinor = budgets.reduce((total, budget) => {
    if (!budget.categoryId) {
      return total;
    }

    return total + (spentByCategory.get(budget.categoryId) ?? zero);
  }, zero);

  const remainingMinor = totalBudgetMinor - totalSpentMinor;
  const currency = budgets[0]?.currency ?? "USD";

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
        <p className="mt-2 text-slate-600">
          Set monthly limits and compare them with your real expenses.
        </p>
      </div>

      <div className="mt-6">
        <BudgetMonthPicker month={monthValue} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <BudgetSummaryCard
          label={`Budget for ${formatMonthLabel(monthValue)}`}
          value={formatMoneyFromMinorUnits(totalBudgetMinor, currency)}
        />

        <BudgetSummaryCard
          label="Spent from budgeted categories"
          value={formatMoneyFromMinorUnits(totalSpentMinor, currency)}
          valueClassName="text-red-600"
        />

        <BudgetSummaryCard
          label={remainingMinor >= zero ? "Remaining" : "Over budget"}
          value={formatMoneyFromMinorUnits(
            remainingMinor >= zero ? remainingMinor : -remainingMinor,
            currency
          )}
          valueClassName={remainingMinor >= zero ? "text-emerald-600" : "text-red-600"}
        />
      </div>

      <form
        action={createOrUpdateBudget}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-900">
          Create or update budget
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose an expense category and set the monthly limit.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Month</label>
            <input
              type="month"
              name="month"
              defaultValue={monthValue}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Expense category
            </label>
            <select
              name="categoryId"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            >
              <option value="">Select category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Budget amount
            </label>
            <input
              name="amount"
              placeholder="300.00"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        <button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Save budget
        </button>
      </form>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            {formatMonthLabel(monthValue)} budgets
          </h2>
          <p className="text-sm text-slate-500">
            {budgets.length} budget{budgets.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {budgets.length === 0 ? (
            <p className="text-sm text-slate-500">
              No budgets yet for this month.
            </p>
          ) : (
            budgets.map((budget) => {
              const spentMinor = budget.categoryId
                ? spentByCategory.get(budget.categoryId) ?? zero
                : zero;

              const remainingForBudget = budget.limitAmountMinor - spentMinor;

              const progressPercent =
                budget.limitAmountMinor > zero
                  ? Number((spentMinor * oneHundred) / budget.limitAmountMinor)
                  : 0;

              const progressWidth = Math.min(progressPercent, 100);

              const statusText =
                progressPercent >= 100
                  ? "Over budget"
                  : progressPercent >= budget.alertThresholdPercent
                    ? "Near limit"
                    : "On track";

              const progressColorClass =
                progressPercent >= 100
                  ? "bg-red-600"
                  : progressPercent >= budget.alertThresholdPercent
                    ? "bg-amber-500"
                    : "bg-emerald-600";

              const categoryName = budget.category?.name ?? "Deleted category";

              return (
                <div
                  key={budget.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="font-medium text-slate-900">
                        {categoryName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatMoneyFromMinorUnits(spentMinor, budget.currency)}{" "}
                        spent of{" "}
                        {formatMoneyFromMinorUnits(
                          budget.limitAmountMinor,
                          budget.currency
                        )}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p
                        className={`text-sm font-semibold ${
                          remainingForBudget >= zero
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {remainingForBudget >= zero ? "Remaining " : "Over "}
                        {formatMoneyFromMinorUnits(
                          remainingForBudget >= zero
                            ? remainingForBudget
                            : -remainingForBudget,
                          budget.currency
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {progressPercent}% · {statusText}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${progressColorClass}`}
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>

                  <form action={archiveBudget} className="mt-3">
                    <input type="hidden" name="budgetId" value={budget.id} />
                    <button className="text-xs font-medium text-red-600 hover:text-red-700">
                      Delete budget
                    </button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function BudgetSummaryCard({
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
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
    </div>
  );
}