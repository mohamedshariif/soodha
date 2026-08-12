import { createExpense } from "./actions";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { formatDateForDisplay } from "@/lib/date";
import { getTodayDateInputValue } from "@/lib/date";
import { AddExpenseModal } from "./add-expense-modal";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export default function ExpensesPage() {
  redirect("/transactions?type=EXPENSE");
}

/* export default async function ExpensesPage() {
  const appUser = await getCurrentAppUser();

  const [expenseCategories, recentExpenses, accounts] = await Promise.all([
  prisma.category.findMany({
    where: {
      userId: appUser.id,
      type: "EXPENSE",
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  }),

  prisma.transaction.findMany({
    where: {
      userId: appUser.id,
      type: "EXPENSE",
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
    take: 10,
  }),

  prisma.account.findMany({
    where: {
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  }),
]);


  const today = getTodayDateInputValue();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
      <p className="mt-2 text-slate-600">
        Add and track money going out of your account.
      </p>

      <AddExpenseModal
        expenseCategories={expenseCategories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        accounts={accounts.map((account) => ({
          id: account.id,
          name: account.name,
          type: account.type,
          currency: account.currency,
          isDefault: account.isDefault,
        }))}
        today={today}
      />

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Recent expenses</h2>

        <div className="mt-4 space-y-2">
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-500">No expenses added yet.</p>
          ) : (
            recentExpenses.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {transaction.category?.name} ·{" "}
                    {formatDateForDisplay(transaction.transactionDate)}
                  </p>
                </div>

                <p className="text-sm font-semibold text-red-600">
                  -
                  {formatMoneyFromMinorUnits(
                    transaction.amountMinor,
                    transaction.currency
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
} */