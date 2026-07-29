import Link from "next/link";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { cancelTransaction } from "./actions";
import { formatDateForDisplay } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const appUser = await getCurrentAppUser();

  const account = await prisma.account.findFirst({
    where: {
      userId: appUser?.id,
      isDefault: true,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: appUser?.id,
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
    take: 20,
  });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="mt-2 text-slate-600">
            View all income and expenses in one place.
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

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500">Default account balance</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">
          {account
            ? formatMoneyFromMinorUnits(
                account.currentBalanceMinor,
                account.currency
              )
            : "$0.00"}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Recent transactions</h2>

        <div className="mt-4 space-y-2">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          ) : (
            transactions.map((transaction) => {
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

                    <p className="mt-1 text-xs text-slate-500">{transaction.type}</p>

                    <Link
                      href={`/transactions/${transaction.id}/edit`}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Edit
                    </Link>

                    <form action={cancelTransaction} className="mt-2">
                      <input type="hidden" name="transactionId" value={transaction.id} />
                      <button className="text-xs font-medium text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </form>
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