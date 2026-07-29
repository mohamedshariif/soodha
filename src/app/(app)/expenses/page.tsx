import { createExpense } from "./actions";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { formatDateForDisplay } from "@/lib/date";
import { getTodayDateInputValue } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const appUser = await getCurrentAppUser();

  const expenseCategories = await prisma.category.findMany({
    where: {
      userId: appUser?.id,
      type: "EXPENSE",
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  const recentExpenses = await prisma.transaction.findMany({
    where: {
      userId: appUser?.id,
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
    take: 5,
  });

  const today = getTodayDateInputValue();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
      <p className="mt-2 text-slate-600">
        Add and track money going out of your account.
      </p>

      <form
        action={createExpense}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-900">Add expense</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Amount
            </label>
            <input
              name="amount"
              placeholder="25.00"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Category
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
              Date
            </label>
            <input
              type="date"
              name="transactionDate"
              defaultValue={today}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              name="description"
              placeholder="e.g. Lunch"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Note
            </label>
            <textarea
              name="note"
              placeholder="Optional note"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>
        </div>

        <button className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Save expense
        </button>
      </form>

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
}