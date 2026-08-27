"use server";

import { revalidatePath } from "next/cache";
import { actionSuccess, actionError, type ActionResult } from "@/lib/action-result";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function createExpense(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const amountValue = formData.get("amount")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const accountId = formData.get("accountId")?.toString();
    const transactionDateValue = formData.get("transactionDate")?.toString();
    const note = formData.get("note")?.toString().trim();

    if (!amountValue) {
      throw new Error("Amount is required.");
    }

    if (!categoryId) {
      throw new Error("Category is required.");
    }

    if (!accountId) {
      throw new Error("Account is required.");
    }

    if (!transactionDateValue) {
      throw new Error("Date is required.");
    }

    const amountMinor = parseAmountToMinorUnits(amountValue);
    const transactionDate =
      parseDateInputToTransactionDate(transactionDateValue);

    await prisma.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: {
          id: accountId,
          userId: appUser.id,
          status: "ACTIVE",
          deletedAt: null,
        },
      });

      if (!account) {
        throw new Error("Account not found.");
      }

      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: appUser.id,
          type: "EXPENSE",
          status: "ACTIVE",
          deletedAt: null,
        },
      });

      if (!category) {
        throw new Error("Expense category not found.");
      }

      await tx.transaction.create({
        data: {
          userId: appUser.id,
          accountId: account.id,
          categoryId: category.id,
          type: "EXPENSE",
          amountMinor,
          currency: account.currency,
          transactionDate,
          note: note || null,
          sourceType: "MANUAL",
          status: "ACTIVE",
        },
      });

      await tx.account.update({
        where: {
          id: account.id,
        },
        data: {
          currentBalanceMinor: {
            decrement: amountMinor,
          },
        },
      });
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");

    return actionSuccess("Expense was added successfully.");
  } catch (error) {
    return actionError(error, "Could not save expenses.");
  }
}
