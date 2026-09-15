import { ReportSummaryCards } from "./_components/report-summary-cards";
import { DailyCashFlowSection } from "./_components/daily-cash-flow-sec";
import { ExpenseCategoriesSection } from "./_components/expense-cate-sec";
import { ManagedMovementsSection } from "./_components/managed-move-sec";
import { isMonthInputValue, parseMonthInputToBudgetPeriod } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { getManagedSourceLabel } from "@/lib/reports";

export const dynamic = "force-dynamic";

type ReportsSearchParams = { month?: string };

type ReportTransaction = {
  sourceType: string;
  category: { name: string } | null;
};

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
  if (!appUser) throw new Error("You must be signed in.");

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
      transactionDate: { gte: periodStart, lte: periodEnd },
    },
    include: { category: true, account: true },
    orderBy: { transactionDate: "desc" },
  });

  const incomeTransactions = transactions.filter((t) => t.type === "INCOME");
  const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");
  const savingsContributionTransactions = transactions.filter(
    (t) => t.sourceType === "SAVINGS_CONTRIBUTION",
  );
  const billPaymentTransactions = transactions.filter(
    (t) => t.sourceType === "BILL_PAYMENT",
  );
  const debtPaymentTransactions = transactions.filter(
    (t) => t.sourceType === "DEBT_PAYMENT",
  );

  const incomeTotalMinor = incomeTransactions.reduce(
    (total, t) => total + t.amountMinor,
    zero,
  );
  const expenseTotalMinor = expenseTransactions.reduce(
    (total, t) => total + t.amountMinor,
    zero,
  );
  const savingsContributionTotalMinor = savingsContributionTransactions.reduce(
    (total, t) => total + t.amountMinor,
    zero,
  );
  const billPaymentTotalMinor = billPaymentTransactions.reduce(
    (total, t) => total + t.amountMinor,
    zero,
  );
  const debtPaymentTotalMinor = debtPaymentTransactions.reduce(
    (total, t) => total + t.amountMinor,
    zero,
  );

  const netAfterExpensesMinor = incomeTotalMinor - expenseTotalMinor;
  const availableCashChangeMinor =
    incomeTotalMinor - expenseTotalMinor - savingsContributionTotalMinor;

  const currency =
    transactions[0]?.currency ?? appUser.preferences?.defaultCurrency ?? "USD";

  const expenseCategoryMap = new Map<
    string,
    { name: string; amountMinor: bigint; count: number }
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
    }),
  );

  for (const transaction of transactions) {
    const dayIndex = transaction.transactionDate.getUTCDate() - 1;
    if (!dailyCashFlowData[dayIndex]) continue;

    if (transaction.type === "INCOME") {
      dailyCashFlowData[dayIndex].income +=
        Number(transaction.amountMinor) / 100;
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
    { name: "Bills", amount: Number(billPaymentTotalMinor) / 100 },
    { name: "Savings", amount: Number(savingsContributionTotalMinor) / 100 },
    { name: "Debts", amount: Number(debtPaymentTotalMinor) / 100 },
  ];

  return (
    <div>
      <ReportSummaryCards
        incomeTotalMinor={incomeTotalMinor}
        incomeCount={incomeTransactions.length}
        expenseTotalMinor={expenseTotalMinor}
        expenseCount={expenseTransactions.length}
        netAfterExpensesMinor={netAfterExpensesMinor}
        availableCashChangeMinor={availableCashChangeMinor}
        currency={currency}
      />

      <DailyCashFlowSection
        data={dailyCashFlowData}
        currency={currency}
        monthValue={currentMonthValue}
        recordCount={transactions.length}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ExpenseCategoriesSection
          categories={topExpenseCategories}
          chartData={expenseCategoryChartData}
          currency={currency}
        />

        <ManagedMovementsSection
          chartData={managedMovementChartData}
          billPaymentTotalMinor={billPaymentTotalMinor}
          billPaymentCount={billPaymentTransactions.length}
          savingsContributionTotalMinor={savingsContributionTotalMinor}
          savingsContributionCount={savingsContributionTransactions.length}
          debtPaymentTotalMinor={debtPaymentTotalMinor}
          debtPaymentCount={debtPaymentTransactions.length}
          currency={currency}
        />
      </div>
    </div>
  );
}
