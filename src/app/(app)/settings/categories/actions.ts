"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { CATEGORY_COLORS } from "@/lib/colors/category-colors";
import { suggestCategoryIcon } from "@/lib/icons/category-icon-suggests";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";

type CategoryType = "INCOME" | "EXPENSE";

function isCategoryType(value: FormDataEntryValue | null): value is CategoryType {
  return value === "INCOME" || value === "EXPENSE";
}

function formatCategoryName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function createCategory(formData: FormData) {
  try {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const rawName = formData.get("name")?.toString();
  const type = formData.get("type");
  const rawColor = formData.get("color")?.toString();

  if (!rawName?.trim()) {
    throw new Error("Category name is required.");
  }

  if (!isCategoryType(type)) {
    throw new Error("Category type is invalid.");
  }

  const color = rawColor && CATEGORY_COLORS.includes(rawColor as (typeof CATEGORY_COLORS)[number])
    ? rawColor
    : CATEGORY_COLORS[0];

  const name = formatCategoryName(rawName);

  const exisiting = await prisma.category.findFirst({
    where: {
      userId: appUser.id,
      name,
      type,
      deletedAt: null
    },
  });

  if (exisiting) {
    throw new Error(`"${name}" already exisits in ${type === "INCOME" ? "Income" : "Expense"} categories.`);
  }

  await prisma.category.upsert({
    where: {
      userId_name_type: {
        userId: appUser.id,
        name,
        type,
      },
    },
    update: {
      status: "ACTIVE",
      deletedAt: null,
    },
    create: {
      userId: appUser.id,
      name,
      type,
      icon: suggestCategoryIcon(name),
      color,
      isDefault: false,
      status: "ACTIVE",
    },
  });

  revalidatePath("/settings/categories");

  return actionSuccess(`"${name}" was added.`);
} catch(error) {
  return actionError(error, "Could not create category.");
}
}

export async function updateCategory(formData: FormData) {
  try {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const categoryId = formData.get("categoryId")?.toString();
  const rawName = formData.get("name")?.toString();

  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  if (!rawName?.trim()) {
    throw new Error("Category name is required.");
  }

  const name = formatCategoryName(rawName);

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId: appUser.id,
      isDefault: false,
    },
  });

  if (!category) {
    throw new Error("Category not found or cannot be edited.");
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      userId: appUser.id,
      name,
      type: category.type,
      NOT: {
        id: categoryId,
      },
    },
  });

  if (existingCategory) {
    throw new Error(`"${name}" already exists.`);
  }

  await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
      icon: suggestCategoryIcon(name),
    },
  });

  revalidatePath("/settings/categories");

  return actionSuccess(`"${name}" was updated.`)
} catch(error) {
  return actionError(error, "Could not update category.");
}
}

export async function deleteCategory(formData: FormData) {
  try {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const categoryId = formData.get("categoryId")?.toString();

  if (!categoryId) {
    throw new Error("Category ID is required.");
  }

  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId: appUser.id,
    },
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  if (category.isDefault) {
    throw new Error("Default categories cannot be deleted.");
  }

  const [transactionCount, budgetCount, billCount] = await Promise.all([
    prisma.transaction.count({
      where: { userId: appUser.id, categoryId },
    }),
    prisma.budget.count({
      where: { userId: appUser.id, categoryId },
    }),
    prisma.bill.count({
      where: { userId: appUser.id, categoryId },
    }),
  ]);

  const isUsed = transactionCount > 0 || budgetCount > 0 || billCount > 0;

  if (isUsed) {
    await prisma.category.update({
      where: { id: categoryId },
      data: { status: "ARCHIVED", deletedAt: new Date() },
    });

    revalidatePath("/settings/categories");
    return actionSuccess(`"${category.name}" was archieved since it's in use.`);
  }

  await prisma.category.delete({
    where: { id: categoryId }
  });
  
  revalidatePath("/settings/categories");
  return actionSuccess(`"${category.name}" was deleted.`);
} catch(error) {
  return actionError(error, "Could not delete category.");
}

}