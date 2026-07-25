import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { createCategory, updateCategory, deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const appUser = await getCurrentAppUser();

  const categories = await prisma.category.findMany({
    where: {
      userId: appUser?.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    orderBy: [{ type: "asc" }, { isDefault: "desc" }, { name: "asc" }],
  });

  const incomeCategories = categories.filter(
    (category) => category.type === "INCOME",
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "EXPENSE",
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
      <p className="mt-2 text-slate-600">
        Manage your income and expense categories.
      </p>

      <form
        action={createCategory}
        className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-900">Create category</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Category name
            </label>
            <input
              name="name"
              placeholder="e.g. Coffee"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Type</label>
            <select
              name="type"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              defaultValue="EXPENSE"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Add category
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CategoryList title="Income categories" categories={incomeCategories} />
        <CategoryList
          title="Expense categories"
          categories={expenseCategories}
        />
      </div>
    </div>
  );
}

function CategoryList({
  title,
  categories,
}: {
  title: string;
  categories: {
    id: string;
    name: string;
    isDefault: boolean;
  }[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>

      <div className="mt-4 space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {category.name}
                </p>
                <p className="text-xs text-slate-500">
                  {category.isDefault ? "Default" : "Custom"}
                </p>
              </div>

              {!category.isDefault && (
                <div className="flex items-center gap-2">
                  <form
                    action={updateCategory}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="hidden"
                      name="categoryId"
                      value={category.id}
                    />
                    <input
                      name="name"
                      defaultValue={category.name}
                      className="text-emerald-700 w-32 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-emerald-500"
                    />
                    <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Save
                    </button>
                  </form>

                  <form action={deleteCategory}>
                    <input
                      type="hidden"
                      name="categoryId"
                      value={category.id}
                    />
                    <button className="text-sm font-medium text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
