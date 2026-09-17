import { AddExpenseModal } from "@/app/(app)/transactions/expenses/add-expense-modal";
import { AddIncomeModal } from "@/app/(app)/transactions/income/add-income-modal";
import { TransactionsFilterForm } from "./transactions-filter-form";
import { TransactionRow } from "./_components/transaction-row";
import { PaginationControls } from "./_components/pagination-controls";
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

function isTransactionType(
  value?: string,
): value is TransactionFilterType {
  return (
    value === "INCOME" ||
    value === "EXPENSE" ||
    value === "TRANSFER"
  );
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

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const filters = await searchParams;

  const today = getTodayDateInputValue();

  const selectedType: TransactionFilterType | "" = isTransactionType(
    filters.type,
  )
    ? filters.type
    : "";

  const search = filters.search?.trim() ?? "";
  const selectedCategoryId = filters.categoryId ?? "";
  const requestedPage = getPageNumber(filters.page);

  const [accounts, categories] = await Promise.all([
    prisma.account.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),

    prisma.category.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: [
        { type: "asc" },
        { isDefault: "desc" },
        { name: "asc" },
      ],
    }),
  ]);

  const validCategoryId =
    selectedType === "TRANSFER"
      ? ""
      : categories.some(
            (category) => 
              category.id === selectedCategoryId && 
              (!selectedType || category.type === selectedType),
          )
        ? selectedCategoryId
        : "";

  const transactionWhere = {
    userId: appUser.id,
    status: "ACTIVE" as const,
    deletedAt: null,
    ...(selectedType ? { type: selectedType } : {}),
    ...(validCategoryId ? { categoryId: validCategoryId } : {}),
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
  };

  const totalTransactions = await prisma.transaction.count({
    where: transactionWhere,
  });

  const totalPages = Math.ceil(totalTransactions / PAGE_SIZE);

  const currentPage =
    totalPages === 0
      ? 1
      : Math.min(requestedPage, totalPages);

  const [transactions] = await Promise.all([
    prisma.transaction.findMany({
      where: transactionWhere,
      include: {
        category: true,
        account: true,
      },
      orderBy: [
        { transactionDate: "desc" },
        { id: "desc" },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const filterState = {
    type: selectedType,
    categoryId: validCategoryId,
    search,
  };

  const incomeCategories = categories
    .filter((category) => category.type === "INCOME")
    .map((category) => ({
      id: category.id,
      name: category.name,
    }));

  const expenseCategories = categories
    .filter((category) => category.type === "EXPENSE")
    .map((category) => ({
      id: category.id,
      name: category.name,
    }));

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
        filters={{
          search,
          type: selectedType,
          categoryId: validCategoryId,
        }}
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
          <h2 className="font-semibold text-foreground">
            Transaction results
          </h2>

          <p className="text-sm text-muted-foreground">
            {transactions.length} record
            {transactions.length === 1 ? "" : "s"} · Page{" "}
            {currentPage}
            {totalPages > 0 ? ` of ${totalPages}` : ""}
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transactions match your filters.
            </p>
          ) : (
            transactions.map((transaction) => (
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
          currentPage={currentPage}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          previousHref={buildPageHref(
            filterState,
            currentPage - 1,
          )}
          nextHref={buildPageHref(
            filterState,
            currentPage + 1,
          )}
          getPageHref={(page) =>
            buildPageHref(filterState, page)
          }
        />
      </section>
    </div>
  );
}