"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";

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
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const rawName = formData.get("name")?.toString();
  const type = formData.get("type");

  if (!rawName?.trim()) {
    throw new Error("Category name is required.");
  }

  if (!isCategoryType(type)) {
    throw new Error("Category type is invalid.");
  }

  const name = formatCategoryName(rawName);

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
      isDefault: false,
      status: "ACTIVE",
    },
  });

  revalidatePath("/settings/categories");
}

export async function updateCategory(formData: FormData) {
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
    throw new Error("A category with this name already exists.");
  }

  await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
    },
  });

  revalidatePath("/settings/categories");
}

export async function deleteCategory(formData: FormData) {
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
      where: {
        userId: appUser.id,
        categoryId,
      },
    }),
    prisma.budget.count({
      where: {
        userId: appUser.id,
        categoryId,
      },
    }),
    prisma.bill.count({
      where: {
        userId: appUser.id,
        categoryId,
      },
    }),
  ]);

  const isUsed = transactionCount > 0 || budgetCount > 0 || billCount > 0;

  if (isUsed) {
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });
  } else {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
  }

  revalidatePath("/settings/categories");
}