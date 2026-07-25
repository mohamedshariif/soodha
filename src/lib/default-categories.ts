import { prisma } from "@/lib/prisma";

const defaultCategories = [
  // Income
  {
    name: "Salary",
    type: "INCOME",
    icon: "wallet",
    color: "#10B981",
  },
  {
    name: "Business",
    type: "INCOME",
    icon: "briefcase",
    color: "#22C55E",
  },
  {
    name: "Other Income",
    type: "INCOME",
    icon: "plus-circle",
    color: "#14B8A6",
  },

  // Expenses
  {
    name: "Food",
    type: "EXPENSE",
    icon: "utensils",
    color: "#EF4444",
  },
  {
    name: "Bills",
    type: "EXPENSE",
    icon: "receipt",
    color: "#8B5CF6",
  },
  {
    name: "Other Expense",
    type: "EXPENSE",
    icon: "circle",
    color: "#64748B",
  },
] as const;

export async function ensureDefaultCategories(userId: string) {
  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      userId,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: true,
      status: "ACTIVE",
    })),
    skipDuplicates: true,
  });
}