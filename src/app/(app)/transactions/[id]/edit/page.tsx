import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMinorUnitsForInput } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { updateTransaction } from "../../actions";
import { formatDateForInput } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      id,
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
      sourceType: "MANUAL",
    },
    include: {
      category: true,
      account: true,
    },
  });

  if (!transaction) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: appUser.id,
      type: transaction.type === "INCOME" ? "INCOME" : "EXPENSE",
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  const transactionDateValue = formatDateForInput(transaction.transactionDate);

  const isIncome = transaction.type === "INCOME";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Edit transaction
          </h1>
          <p className="mt-2 text-slate-600">
            Update this {isIncome ? "income" : "expense"} transaction safely.
          </p>
        </div>

        <Link
          href="/transactions"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Back to transactions
        </Link>
      </div>

      <form
        action={updateTransaction}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
      >
        <input type="hidden" name="transactionId" value={transaction.id} />

        <div className="mb-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Transaction type</p>
          <p
            className={`mt-1 font-semibold ${
              isIncome ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {transaction.type}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Type is locked for now. To change income to expense, delete this
            transaction and create a new one.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Amount
            </label>
            <input
              name="amount"
              defaultValue={formatMinorUnitsForInput(transaction.amountMinor)}
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
              defaultValue={transaction.categoryId ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
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
              defaultValue={transactionDateValue}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>
            <input
              name="description"
              defaultValue={transaction.description}
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
              defaultValue={transaction.note ?? ""}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              rows={3}
            />
          </div>
        </div>

        <button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Save changes
        </button>
      </form>
    </div>
  );
}