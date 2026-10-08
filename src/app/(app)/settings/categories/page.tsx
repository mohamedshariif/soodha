import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { CreateCategoryForm } from "./_components/create-category-form";
import { CategoryRow } from "./_components/category-row";
import { PageHeader } from "@/components/ui/page-header";

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

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div>
      <PageHeader
        title="Category"
        description="Manage your income and expenses categories"
      >  
        <CreateCategoryForm />
      </PageHeader>


      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CategoryListSection
          title="Income categories"
          categories={incomeCategories}
        />
        <CategoryListSection
          title="Expense categories"
          categories={expenseCategories}
        />
      </div>
    </div>
  );
}

function CategoryListSection({
  title,
  categories,
}: {
  title: string;
  categories: {
    id: string;
    name: string;
    isDefault: boolean;
    icon: string | null;
    color: string | null;
  }[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">{title}</h2>

      <div className="mt-4 space-y-2">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))
        )}
      </div>
    </section>
  );
}
