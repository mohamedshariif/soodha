"use server";

import { revalidatePath } from "next/cache";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export async function createIncome(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const amountValue = formData.get("amount")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const accountId = formData.get("accountId")?.toString();
  const description = formData.get("description")?.toString().trim();
  const transactionDateValue = formData.get("transactionDate")?.toString();
  const note = formData.get("note")?.toString().trim();

  if (!amountValue) {
    throw new Error("Amount is required.");
  }

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  const amountMinor = parseAmountToMinorUnits(amountValue);
  const transactionDate = parseDateInputToTransactionDate(transactionDateValue);

  await prisma.$transaction(async (tx) => {
    const account = accountId
      ? await tx.account.findFirst({
          where: {
            id: accountId,
            userId: appUser.id,
            status: "ACTIVE",
            deletedAt: null,
          },
        })
      : await tx.account.findFirst({
          where: {
            userId: appUser.id,
            isDefault: true,
            status: "ACTIVE",
            deletedAt: null,
          },
        });

    if (!account) {
      throw new Error("Account not found.");
    }

    const category = await tx.category.findFirst({
      where: {
        id: categoryId,
        userId: appUser.id,
        type: "INCOME",
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!category) {
      throw new Error("Income category not found.");
    }

    await tx.transaction.create({
      data: {
        userId: appUser.id,
        accountId: account.id,
        categoryId: category.id,
        type: "INCOME",
        amountMinor,
        currency: account.currency,
        transactionDate,
        description,
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
          increment: amountMinor,
        },
      },
    });
  });

  revalidatePath("/income");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/reports");
}