"use server";

import { revalidatePath } from "next/cache";
import { parseMonthInputToBudgetPeriod } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";

export async function createOrUpdateBudget(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) throw new Error("You must be signed in.");

    const categoryId = formData.get("categoryId")?.toString();
    const amountValue = formData.get("amount")?.toString();
    const monthValue = formData.get("month")?.toString();
    const alertThresholdValue = formData.get("alertThresholdPercent")?.toString();

    if (!categoryId) throw new Error("Category is required.");
    if (!amountValue) throw new Error("Budget amount is required.");

    const alertThresholdPercent = alertThresholdValue ? Number(alertThresholdValue) : 75;
    if (!Number.isFinite(alertThresholdPercent) || alertThresholdPercent <= 0 || alertThresholdPercent > 100) {
      throw new Error("Alert threshold must be between 1 and 100.");
    }

    const limitAmountMinor = parseAmountToMinorUnits(amountValue);
    const { periodStart, periodEnd } = parseMonthInputToBudgetPeriod(monthValue);

    const [account, category] = await Promise.all([
      prisma.account.findFirst({
        where: { userId: appUser.id, isDefault: true, status: "ACTIVE", deletedAt: null },
      }),
      prisma.category.findFirst({
        where: { id: categoryId, userId: appUser.id, type: "EXPENSE", status: "ACTIVE", deletedAt: null },
      }),
    ]);

    if (!account) throw new Error("Default account not found.");
    if (!category) throw new Error("Expense category not found.");

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
        where: { id: existingBudget.id },
        data: {
          name: `${category.name} Budget`,
          limitAmountMinor,
          currency: account.currency,
          alertThresholdPercent,
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
          alertThresholdPercent,
          status: "ACTIVE",
        },
      });
    }

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return actionSuccess(`Budget for "${category.name}" was saved.`);
  } catch (error) {
    return actionError(error, "Could not save budget.");
  }
}

export async function deleteBudget(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) throw new Error("You must be signed in.");

    const budgetId = formData.get("budgetId")?.toString();
    if (!budgetId) throw new Error("Budget ID is required.");

    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId: appUser.id, deletedAt: null },
      include: { category: true },
    });

    if (!budget) throw new Error("Budget not found or already deleted.");

    await prisma.budget.delete({ where: { id: budget.id } });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return actionSuccess(`Budget for "${budget.category?.name ?? "category"}" was deleted.`);
  } catch (error) {
    return actionError(error, "Could not delete budget.");
  }
}