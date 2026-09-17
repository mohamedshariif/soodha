"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type CategoryOption = {
  id: string;
  name: string;
  type: string;
};

type TransactionFilters = {
  search: string;
  type: string;
  categoryId: string;
};

function buildTransactionsUrl(filters: TransactionFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const cleanValue = value?.trim();

    if (cleanValue) {
      params.set(key, cleanValue);
    }
  });

  const query = params.toString();

  return query ? `/transactions?${query}` : "/transactions";
}

export function TransactionsFilterForm({
  categories,
  filters,
}: {
  categories: CategoryOption[];
  filters: TransactionFilters;
}) {
  return (
    <TransactionsFilterControls
      key={`${filters.search}-${filters.type}-${filters.categoryId}`}
      categories={categories}
      filters={filters}
    />
  );
}

function TransactionsFilterControls({
  categories,
  filters,
}: {
  categories: CategoryOption[];
  filters: TransactionFilters;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(filters.search);

  const visibleCategories =
    filters.type === "TRANSFER"
      ? []
      : filters.type
        ? categories.filter((category) => category.type === filters.type)
        : categories;

  function updateFilters(nextFilters: Partial<TransactionFilters>) {
    const url = buildTransactionsUrl({
      ...filters,
      search: searchValue,
      ...nextFilters,
    });

    startTransition(() => {
      router.replace(url, { scroll: false });
    });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue === filters.search) {
        return;
      }

      const url = buildTransactionsUrl({
        ...filters,
        search: searchValue,
      });

      startTransition(() => {
        router.replace(url, { scroll: false });
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters, router, searchValue]);

  return (
    <section className="mt-2 rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">Filter transactions</h2>

      <div className="mt-4 grid gap-2 lg:grid-cols-3">
        <div className="relative rounded-lg">
          <Search className="w-4 h-4 absolute top-3 left-3 text-muted-foreground"/>
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Salary, lunch..."
          className="w-full rounded-lg border border-border px-3 py-2 pl-8 text-sm outline-none focus:border-primary"
        />
        </div>

        <select
          value={filters.type}
          onChange={(event) =>
            updateFilters({ type: event.target.value, categoryId: "" })
          }
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="TRANSFER">Transfer</option>
        </select>

        <select
          value={filters.categoryId}
          onChange={(event) =>
            updateFilters({ categoryId: event.target.value })
          }
          disabled={filters.type === "TRANSFER"}
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
        >
          <option value="">All categories</option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.type.toLowerCase()})
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
