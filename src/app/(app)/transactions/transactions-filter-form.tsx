"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type CategoryOption = {
  id: string;
  name: string;
  type: string;
};

type TransactionFilters = {
  search: string;
  type: string;
  categoryId: string;
  from?: string;
  to?: string;
};

function buildTransactionsUrl(filters: TransactionFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const cleanValue = value.trim();

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(filters.search);

  const visibleCategories = filters.type
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
    setSearchValue(filters.search);
  }, [filters.search]);

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
  }, [filters, router, searchValue, startTransition]);

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold text-slate-900">Filter transactions</h2>

        {isPending && (
          <p className="text-xs font-medium text-slate-500">Filtering...</p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="text-sm font-medium text-slate-700">Search</label>
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Salary, lunch..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Type</label>
          <select
            value={filters.type}
            onChange={(event) =>
              updateFilters({
                type: event.target.value,
                categoryId: "",
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            value={filters.categoryId}
            onChange={(event) =>
              updateFilters({
                categoryId: event.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="">All categories</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.type.toLowerCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(event) =>
              updateFilters({
                from: event.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(event) =>
              updateFilters({
                to: event.target.value,
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <Link
          href="/transactions"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </Link>
      </div>
    </section>
  );
}