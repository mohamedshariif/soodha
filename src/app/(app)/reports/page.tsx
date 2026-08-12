import {
  ExpenseCategoryDonutChart,
  ManagedMovementBarChart,
  MonthlyCashFlowChart,
} from "@/components/finance-charts";
import { MonthSelector } from "@/components/month-selector";
import {
  formatDateForDisplay,
  formatMonthLabel,
  isMonthInputValue,
  parseMonthInputToBudgetPeriod,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ReportsSearchParams = {
  month?: string;
};

type ReportTransaction = {
  sourceType: string;
  category: {
    name: string;
  } | null;
};

function getManagedSourceLabel(sourceType: string) {
  switch (sourceType) {
    case "BILL_PAYMENT":
      return "Bill payments";
    case "SAVINGS_CONTRIBUTION":
      return "Savings contributions";
    case "DEBT_PAYMENT":
      return "Debt payments";
    case "MANUAL":
      return "Manual records";
    default:
      return "Other records";
  }
}

function getCategoryReportName(transaction: ReportTransaction) {
  if (transaction.category?.name) {
    return transaction.category.name;
  }

  return getManagedSourceLabel(transaction.sourceType);
}

function compareBigIntDesc(a: bigint, b: bigint) {
  if (a < b) return 1;
  if (a > b) return -1;
  return 0;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<ReportsSearchParams>;
}) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const params = await searchParams;

  const selectedMonthValue = isMonthInputValue(params.month)
    ? params.month
    : undefined;

  const {
    monthValue: currentMonthValue,
    periodStart,
    periodEnd,
  } = parseMonthInputToBudgetPeriod(selectedMonthValue);

  const zero = BigInt(0);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
      transactionDate: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  const incomeTransactions = transactions.filter((transaction) => {
    return transaction.type === "INCOME";
  });

  const expenseTransactions = transactions.filter((transaction) => {
    return transaction.type === "EXPENSE";
  });

  const savingsContributionTransactions = transactions.filter((transaction) => {
    return transaction.sourceType === "SAVINGS_CONTRIBUTION";
  });

  const billPaymentTransactions = transactions.filter((transaction) => {
    return transaction.sourceType === "BILL_PAYMENT";
  });

  const debtPaymentTransactions = transactions.filter((transaction) => {
    return transaction.sourceType === "DEBT_PAYMENT";
  });

  const incomeTotalMinor = incomeTransactions.reduce((total, transaction) => {
    return total + transaction.amountMinor;
  }, zero);

  const expenseTotalMinor = expenseTransactions.reduce((total, transaction) => {
    return total + transaction.amountMinor;
  }, zero);

  const savingsContributionTotalMinor =
    savingsContributionTransactions.reduce((total, transaction) => {
      return total + transaction.amountMinor;
    }, zero);

  const billPaymentTotalMinor = billPaymentTransactions.reduce(
    (total, transaction) => {
      return total + transaction.amountMinor;
    },
    zero
  );

  const debtPaymentTotalMinor = debtPaymentTransactions.reduce(
    (total, transaction) => {
      return total + transaction.amountMinor;
    },
    zero
  );

  const netAfterExpensesMinor = incomeTotalMinor - expenseTotalMinor;

  const availableCashChangeMinor =
    incomeTotalMinor - expenseTotalMinor - savingsContributionTotalMinor;

  const currency =
    transactions[0]?.currency ?? appUser.preferences?.defaultCurrency ?? "USD";

  const expenseCategoryMap = new Map<
    string,
    {
      name: string;
      amountMinor: bigint;
      count: number;
    }
  >();

  for (const transaction of expenseTransactions) {
    const name = getCategoryReportName(transaction);
    const current = expenseCategoryMap.get(name);

    if (current) {
      expenseCategoryMap.set(name, {
        ...current,
        amountMinor: current.amountMinor + transaction.amountMinor,
        count: current.count + 1,
      });
    } else {
      expenseCategoryMap.set(name, {
        name,
        amountMinor: transaction.amountMinor,
        count: 1,
      });
    }
  }

  const topExpenseCategories = Array.from(expenseCategoryMap.values())
    .sort((a, b) => compareBigIntDesc(a.amountMinor, b.amountMinor))
    .slice(0, 5);

  const daysInSelectedMonth = periodEnd.getUTCDate();

  const dailyCashFlowData = Array.from(
    { length: daysInSelectedMonth },
    (_, index) => ({
      day: String(index + 1),
      income: 0,
      expenses: 0,
    })
  );

  for (const transaction of transactions) {
    const dayIndex = transaction.transactionDate.getUTCDate() - 1;

    if (!dailyCashFlowData[dayIndex]) {
      continue;
    }

    if (transaction.type === "INCOME") {
      dailyCashFlowData[dayIndex].income += Number(transaction.amountMinor) / 100;
    }

    if (transaction.type === "EXPENSE") {
      dailyCashFlowData[dayIndex].expenses +=
        Number(transaction.amountMinor) / 100;
    }
  }

  const expenseCategoryChartData = topExpenseCategories.map((category) => ({
    name: category.name,
    amount: Number(category.amountMinor) / 100,
  }));

  const managedMovementChartData = [
    {
      name: "Bills",
      amount: Number(billPaymentTotalMinor) / 100,
    },
    {
      name: "Savings",
      amount: Number(savingsContributionTotalMinor) / 100,
    },
    {
      name: "Debts",
      amount: Number(debtPaymentTotalMinor) / 100,
    },
  ];

  const netAfterExpensesIsPositive = netAfterExpensesMinor >= zero;
  const cashChangeIsPositive = availableCashChangeMinor >= zero;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-2 text-slate-600">
            Review your monthly financial report for{" "}
            {formatMonthLabel(currentMonthValue)}.
          </p>
        </div>

        <MonthSelector value={currentMonthValue} />
      </div>

      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-2 text-slate-600">
          Review your monthly financial report for{" "}
          {formatMonthLabel(currentMonthValue)}.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportSummaryCard
          label="Income"
          value={formatMoneyFromMinorUnits(incomeTotalMinor, currency)}
          helper={`${incomeTransactions.length} income record${
            incomeTransactions.length === 1 ? "" : "s"
          }`}
          valueClassName="text-emerald-600"
        />

        <ReportSummaryCard
          label="Expenses"
          value={formatMoneyFromMinorUnits(expenseTotalMinor, currency)}
          helper={`${expenseTransactions.length} expense record${
            expenseTransactions.length === 1 ? "" : "s"
          }`}
          valueClassName="text-red-600"
        />

        <ReportSummaryCard
          label="Net after expenses"
          value={formatMoneyFromMinorUnits(netAfterExpensesMinor, currency)}
          helper="Income minus expenses"
          valueClassName={
            netAfterExpensesIsPositive ? "text-emerald-600" : "text-red-600"
          }
        />

        <ReportSummaryCard
          label="Available cash change"
          value={formatMoneyFromMinorUnits(availableCashChangeMinor, currency)}
          helper="Income minus expenses and savings"
          valueClassName={
            cashChangeIsPositive ? "text-emerald-600" : "text-red-600"
          }
        />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Daily income vs expenses
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Daily cash flow for {formatMonthLabel(currentMonthValue)}.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {transactions.length} total record
            {transactions.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-5 h-80">
          <MonthlyCashFlowChart data={dailyCashFlowData} currency={currency} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Top expense categories
            </h2>

            <p className="text-sm text-slate-500">
              Top {topExpenseCategories.length}
            </p>
          </div>

          <div className="mt-4 h-72">
            <ExpenseCategoryDonutChart
              data={expenseCategoryChartData}
              currency={currency}
            />
          </div>

          <div className="mt-4 space-y-3">
            {topExpenseCategories.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  No expenses recorded for this month.
                </p>
              </div>
            ) : (
              topExpenseCategories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {category.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {category.count} record
                      {category.count === 1 ? "" : "s"}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoneyFromMinorUnits(category.amountMinor, currency)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">
            Managed money movements
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Bills, savings, and debt activity for this month.
          </p>

          <div className="mt-4 h-64">
            <ManagedMovementBarChart
              data={managedMovementChartData}
              currency={currency}
            />
          </div>

          <div className="mt-4 grid gap-3">
            <ManagedMovementRow
              label="Bill payments"
              value={formatMoneyFromMinorUnits(billPaymentTotalMinor, currency)}
              helper={`${billPaymentTransactions.length} payment${
                billPaymentTransactions.length === 1 ? "" : "s"
              }`}
            />

            <ManagedMovementRow
              label="Savings contributions"
              value={formatMoneyFromMinorUnits(
                savingsContributionTotalMinor,
                currency
              )}
              helper={`${savingsContributionTransactions.length} contribution${
                savingsContributionTransactions.length === 1 ? "" : "s"
              }`}
            />

            <ManagedMovementRow
              label="Debt payments"
              value={formatMoneyFromMinorUnits(debtPaymentTotalMinor, currency)}
              helper={`${debtPaymentTransactions.length} payment${
                debtPaymentTransactions.length === 1 ? "" : "s"
              }`}
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Recent report records
          </h2>
          <p className="text-sm text-slate-500">
            Last {Math.min(transactions.length, 8)}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {transactions.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No records found for this month.
              </p>
            </div>
          ) : (
            transactions.slice(0, 8).map((transaction) => {
              const isIncome = transaction.type === "INCOME";
              const isExpense = transaction.type === "EXPENSE";
              const isTransfer = transaction.type === "TRANSFER";

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {transaction.description}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {getCategoryReportName(transaction)} ·{" "}
                      {formatDateForDisplay(transaction.transactionDate)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isIncome
                          ? "text-emerald-600"
                          : isExpense
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    >
                      {isIncome ? "+" : isExpense ? "-" : ""}
                      {formatMoneyFromMinorUnits(
                        transaction.amountMinor,
                        transaction.currency
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {isTransfer
                        ? "Transfer"
                        : transaction.type === "INCOME"
                          ? "Income"
                          : "Expense"}
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

function ReportSummaryCard({
  label,
  value,
  helper,
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function ManagedMovementRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{helper}</p>
      </div>

      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}