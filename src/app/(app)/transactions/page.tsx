import Link from "next/link";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { cancelTransaction } from "./actions";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { formatDateForDisplay, parseDateInputToTransactionDate } from "@/lib/date";
import { TransactionsFilterForm } from "./transactions-filter-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TransactionSearchParams = {
  type?: string;
  categoryId?: string;
  search?: string;
  from?: string;
  to?: string;
};

function isTransactionType(value?: string) {
  return value === "INCOME" || value === "EXPENSE" || "TRANSFER";
}

function getManagedSourceLabel(sourceType: string) {
  switch (sourceType) {
    case "BILL_PAYMENT":
      return "Managed by bill";
    case "SAVINGS_CONTRIBUTION":
      return "Managed by savings";
    default:
      return "Managed by feature";
  }
}

function isDateInput(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams:Promise<TransactionSearchParams>;
}) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const filters = await searchParams;

  const type = isTransactionType(filters.type) ? filters.type : "";
  const search = filters.search?.trim() ?? "";
  const from = isDateInput(filters.from) ? filters.from : "";
  const to = isDateInput(filters.to) ? filters.to : "";
  const selectedCategoryId = filters.categoryId?.trim() ?? "";

  const [account, categories] = await Promise.all([
    prisma.account.findFirst({
      where: {
        userId: appUser.id,
        isDefault: true,
        status: "ACTIVE",
        deletedAt: null,
      },
    }),

    prisma.category.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  const validCategoryId = categories.some(
    (category) => category.id === selectedCategoryId
  )
    ? selectedCategoryId
    : "";

  const dateFilter: {
    gte?: Date;
    lt?: Date;
  } = {};

  if (from) {
    dateFilter.gte = parseDateInputToTransactionDate(from);
  }

  if (to) {
    const toDateExclusive = parseDateInputToTransactionDate(to);
    toDateExclusive.setUTCDate(toDateExclusive.getUTCDate() + 1);
    dateFilter.lt = toDateExclusive;
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,

      ...(type ? { type } : {}),

      ...(validCategoryId
        ? {
            categoryId: validCategoryId,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                note: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),

      ...(from || to
        ? {
            transactionDate: dateFilter,
          }
        : {}),
    },
    include: {
      category: true,
      account: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
    take: 50,
  });

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="mt-2 text-slate-600">
            View, filter, edit, and manage your money records.
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

      <TransactionsFilterForm
        categories={categories}
        filters={{
          search,
          type,
          categoryId: validCategoryId,
          from,
          to,
        }}
      />

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Transaction results</h2>
          <p className="text-sm text-slate-500">
            Showing {transactions.length} record
            {transactions.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No transactions match your filters.
            </p>
          ) : (
            transactions.map((transaction) => {
              const isIncome = transaction.type === "INCOME";

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
                      {transaction.category?.name ?? "No category"} ·{" "}
                      {transaction.account.name} ·{" "}
                      {formatDateForDisplay(transaction.transactionDate)}
                    </p>

                    {transaction.note && (
                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.note}
                      </p>
                    )}
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

                    {transaction.sourceType === "MANUAL" ? (
                      <div className="mt-2 flex justify-end gap-3">
                        <Link
                          href={`/transactions/${transaction.id}/edit`}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Edit
                        </Link>

                        <form action={cancelTransaction}>
                          <input type="hidden" name="transactionId" value={transaction.id} />
                          <button className="text-xs font-medium text-red-600 hover:text-red-700">
                            Delete
                          </button>
                        </form>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">
                        {getManagedSourceLabel(transaction.sourceType)}
                      </p>
                    )}

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