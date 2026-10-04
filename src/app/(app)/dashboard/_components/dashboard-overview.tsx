import { ArrowDownLeft, ArrowUpRight, WalletCards } from "lucide-react";
import { AddExpenseModal } from "@/app/(app)/transactions/expenses/add-expense-modal";
import { AddIncomeModal } from "@/app/(app)/transactions/income/add-income-modal";
import { SummaryCard } from "@/components/ui/summary-card";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { TimeGreeting } from "@/components/time-greeting";

type CategoryOption = { id: string; name: string };
type AccountOption = {
  id: string;
  name: string;
  type: string;
  currency: string;
  isDefault: boolean;
};

export function DashboardOverview({
  currency,
  totalBalanceMinor,
  incomeMinor,
  incomeCount,
  expenseMinor,
  expenseCount,
  accountCount,
  monthLabel,
  incomeCategories,
  expenseCategories,
  accounts,
  today,
  fullName,
}: {
  currency: string;
  totalBalanceMinor: bigint;
  incomeMinor: bigint;
  incomeCount: number;
  expenseMinor: bigint;
  expenseCount: number;
  accountCount: number;
  monthLabel: string;
  incomeCategories: CategoryOption[];
  expenseCategories: CategoryOption[];
  accounts: AccountOption[];
  today: string;
  fullName: string;
}) {
  const cashFlowMinor = incomeMinor - expenseMinor;
  const zero = 0n;

  return (
    <>
    <TimeGreeting
      name={fullName}
      className="bg-linear-to-r from-emerald-600 via-teal-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(5,150,105,0.2)] sm:hidden"
      />
      <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total balance"
          value={formatMoneyFromMinorUnits(totalBalanceMinor, currency)}
          helper={`${accountCount} active account${accountCount === 1 ? "" : "s"}`}
          icon={<WalletCards className="h-5 w-5" />}
          valueClassName={
            totalBalanceMinor >= zero ? "text-white" : "text-red-600"
          }
          className="bg-linear-to-br from-emerald-600 via-teal-700 to-indigo-900 shadow-lg shadow-emerald-900/20"
          labelClassName="text-white/80"
          iconClassName="bg-primary/40 text-white"
          helperClassName="text-white/80"
        />
        <div className="grid grid-cols-2 gap-2 md:contents">
          <SummaryCard
            label="Income"
            value={formatMoneyFromMinorUnits(incomeMinor, currency)}
            helper={`${incomeCount} record${incomeCount === 1 ? "" : "s"}`}
            icon={<ArrowUpRight className="h-5 w-5" />}
            valueClassName="text-emerald-600"
            iconClassName="bg-muted text-primary"
          />
          <SummaryCard
            label="Expenses"
            value={formatMoneyFromMinorUnits(expenseMinor, currency)}
            helper={`${expenseCount} record${expenseCount === 1 ? "" : "s"}`}
            icon={<ArrowDownLeft className="h-5 w-5" />}
            valueClassName="text-red-600"
            iconClassName="bg-muted text-red-600"
          />
        </div>
        <SummaryCard
          label={`Cash flow ${monthLabel}`}
          value={formatMoneyFromMinorUnits(cashFlowMinor, currency)}
          helper="Income - expenses"
          icon={
            cashFlowMinor >= zero ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownLeft className="h-5 w-5" />
            )
          }
          valueClassName={
            cashFlowMinor >= zero ? "text-emerald-600" : "text-red-600"
          }
          iconClassName={
            cashFlowMinor >= zero
              ? "bg-muted text-emerald-600"
              : "bg-muted text-red-600"
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <AddIncomeModal
          incomeCategories={incomeCategories}
          accounts={accounts}
          today={today}
        />
        <AddExpenseModal
          expenseCategories={expenseCategories}
          accounts={accounts}
          today={today}
        />
      </div>
    </>
  );
}
