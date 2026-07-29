"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function createIncome(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const amountValue = formData.get("amount")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
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

  const account = await prisma.account.findFirst({
    where: {
      userId: appUser.id,
      isDefault: true,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (!account) {
    throw new Error("Default account not found.");
  }

  const category = await prisma.category.findFirst({
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

  const transactionDate = parseDateInputToTransactionDate(transactionDateValue);

  await prisma.$transaction(async (tx) => {
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
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}