import { AddExpenseModal } from "@/app/(app)/transactions/expenses/add-expense-modal";
import { AddIncomeModal } from "@/app/(app)/transactions/income/add-income-modal";
import { TransactionsFilterForm } from "./transactions-filter-form";
import { TransactionRow } from "./_components/transaction-row";
import { PaginationControls } from "./_components/pagination-controls.tsx";
import { getTodayDateInputValue } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TransactionFilterType = "INCOME" | "EXPENSE" | "TRANSFER";

type TransactionsSearchParams = {
  type?: string;
  categoryId?: string;
  search?: string;
  page?: string;
};

const PAGE_SIZE = 10;

function getPageNumber(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function isTransactionType(value?: string): value is TransactionFilterType {
  return value === "INCOME" || value === "EXPENSE" || value === "TRANSFER";
}

function buildPageHref(
  filters: {
    type?: string;
    categoryId?: string;
    search?: string;
  },
  page: number,
) {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.search) params.set("search", filters.search);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<TransactionsSearchParams>;
}) {
  const appUser = await getCurrentAppUser();

  if (!appUser) throw new Error("You must be signed in.");

  const filters = await searchParams;

  const today = getTodayDateInputValue();

  const selectedType: TransactionFilterType | "" = isTransactionType(
    filters.type,
  )
    ? filters.type
    : "";
  const search = filters.search?.trim() ?? "";
  const selectedCategoryId = filters.categoryId ?? "";
  const currentPage = getPageNumber(filters.page);

  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({
      where: { userId: appUser.id, status: "ACTIVE", deletedAt: null },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),

    prisma.category.findMany({
      where: { userId: appUser.id, status: "ACTIVE", deletedAt: null },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }],
    }),
  ]);

  const validCategoryId =
    selectedType === "TRANSFER"
      ? ""
      : categories.some((category) => category.id === selectedCategoryId)
        ? selectedCategoryId
        : "";

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
      ...(selectedType ? { type: selectedType } : {}),
      ...(validCategoryId ? { categoryId: validCategoryId } : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: "insensitive" } },
              { note: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { category: true, account: true },
    orderBy: { transactionDate: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
  });

  const hasNextPage = transactions.length > PAGE_SIZE;
  const pageTransactions = transactions.slice(0, PAGE_SIZE);
  const hasPreviousPage = currentPage > 1;

  const filterState = {
    type: selectedType,
    categoryId: validCategoryId,
    search,
  };

  const incomeCategories = categories
    .filter((category) => category.type === "INCOME")
    .map((category) => ({ id: category.id, name: category.name }));

  const expenseCategories = categories
    .filter((category) => category.type === "EXPENSE")
    .map((category) => ({ id: category.id, name: category.name }));

  const accountOptions = accounts.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    currency: acc.currency,
    isDefault: acc.isDefault,
  }));

  return (
    <div>
      <TransactionsFilterForm
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          type: category.type,
        }))}
        filters={{ search, type: selectedType, categoryId: validCategoryId }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <AddIncomeModal
          incomeCategories={incomeCategories}
          accounts={accountOptions}
          today={today}
        />
        <AddExpenseModal
          expenseCategories={expenseCategories}
          accounts={accountOptions}
          today={today}
        />
      </div>

      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Transaction results</h2>
          <p className="text-sm text-muted-foreground">
            {pageTransactions.length} record
            {pageTransactions.length === 1 ? "" : "s"} · Page {currentPage}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {pageTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transactions match your filters.
            </p>
          ) : (
            pageTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                categories={
                  transaction.type === "INCOME"
                    ? incomeCategories
                    : expenseCategories
                }
              />
            ))
          )}
        </div>

        <PaginationControls
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          previousHref={buildPageHref(filterState, currentPage - 1)}
          nextHref={buildPageHref(filterState, currentPage + 1)}
        />
      </section>
    </div>
  );
}
