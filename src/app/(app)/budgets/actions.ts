"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseMonthInputToBudgetPeriod } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export async function createOrUpdateBudget(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const categoryId = formData.get("categoryId")?.toString();
  const amountValue = formData.get("amount")?.toString();
  const monthValue = formData.get("month")?.toString();

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  if (!amountValue) {
    throw new Error("Budget amount is required.");
  }

  const limitAmountMinor = parseAmountToMinorUnits(amountValue);
  const { periodStart, periodEnd, monthValue: safeMonthValue } =
    parseMonthInputToBudgetPeriod(monthValue);

  const [account, category] = await Promise.all([
    prisma.account.findFirst({
      where: {
        userId: appUser.id,
        isDefault: true,
        status: "ACTIVE",
        deletedAt: null,
      },
    }),

    prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: appUser.id,
        type: "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
      },
    }),
  ]);

  if (!account) {
    throw new Error("Default account not found.");
  }

  if (!category) {
    throw new Error("Expense category not found.");
  }

  const existingBudget = await prisma.budget.findFirst({
    where: {
      userId: appUser.id,
      categoryId: category.id,
      period: "MONTHLY",
      periodStart,
      periodEnd,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (existingBudget) {
    await prisma.budget.update({
      where: {
        id: existingBudget.id,
      },
      data: {
        name: `${category.name} Budget`,
        limitAmountMinor,
        currency: account.currency,
      },
    });
  } else {
    await prisma.budget.create({
      data: {
        userId: appUser.id,
        categoryId: category.id,
        name: `${category.name} Budget`,
        period: "MONTHLY",
        periodStart,
        periodEnd,
        limitAmountMinor,
        currency: account.currency,
        status: "ACTIVE",
      },
    });
  }

  revalidatePath("/budgets");
  revalidatePath("/dashboard");

  redirect(`/budgets?month=${safeMonthValue}`);
}

export async function archiveBudget(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const budgetId = formData.get("budgetId")?.toString();

  if (!budgetId) {
    throw new Error("Budget ID is required.");
  }

  await prisma.budget.updateMany({
    where: {
      id: budgetId,
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    data: {
      status: "ARCHIVED",
      deletedAt: new Date(),
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}