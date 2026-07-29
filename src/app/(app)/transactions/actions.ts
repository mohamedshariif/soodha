"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export async function cancelTransaction(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const transactionId = formData.get("transactionId")?.toString();

  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({
      where: {
        id: transactionId,
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found or already cancelled.");
    }

    if (transaction.sourceType !== "MANUAL") {
      throw new Error("Only manual transactions can be deleted here.");
    }

    await tx.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        status: "CANCELLED",
        deletedAt: new Date(),
      },
    });

    if (transaction.type === "INCOME") {
      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          currentBalanceMinor: {
            decrement: transaction.amountMinor,
          },
        },
      });
    }

    if (transaction.type === "EXPENSE") {
      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          currentBalanceMinor: {
            increment: transaction.amountMinor,
          },
        },
      });
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/income");
  revalidatePath("/expenses");
}

export async function updateTransaction(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const transactionId = formData.get("transactionId")?.toString();
  const amountValue = formData.get("amount")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const description = formData.get("description")?.toString().trim();
  const transactionDateValue = formData.get("transactionDate")?.toString();
  const note = formData.get("note")?.toString().trim();

  if (!transactionId) {
    throw new Error("Transaction ID is required.");
  }

  if (!amountValue) {
    throw new Error("Amount is required.");
  }

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  if (!description) {
    throw new Error("Description is required.");
  }

  const newAmountMinor = parseAmountToMinorUnits(amountValue);

  const transactionDate = parseDateInputToTransactionDate(transactionDateValue);

  await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findFirst({
      where: {
        id: transactionId,
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found or cannot be edited.");
    }

    if (transaction.sourceType !== "MANUAL") {
      throw new Error("Only manual transactions can be edited here.");
    }

    const category = await tx.category.findFirst({
      where: {
        id: categoryId,
        userId: appUser.id,
        type: transaction.type === "INCOME" ? "INCOME" : "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!category) {
      throw new Error("Category not found.");
    }

    const oldAmountMinor = transaction.amountMinor;

    await tx.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        amountMinor: newAmountMinor,
        categoryId: category.id,
        transactionDate,
        description,
        note: note || null,
      },
    });

    if (newAmountMinor === oldAmountMinor) {
      return;
    }

    const difference = newAmountMinor > oldAmountMinor
      ? newAmountMinor - oldAmountMinor
      : oldAmountMinor - newAmountMinor;

    if (transaction.type === "INCOME") {
      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          currentBalanceMinor:
            newAmountMinor > oldAmountMinor
              ? { increment: difference }
              : { decrement: difference },
        },
      });
    }

    if (transaction.type === "EXPENSE") {
      await tx.account.update({
        where: {
          id: transaction.accountId,
        },
        data: {
          currentBalanceMinor:
            newAmountMinor > oldAmountMinor
              ? { decrement: difference }
              : { increment: difference },
        },
      });
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/income");
  revalidatePath("/expenses");

  redirect("/transactions");
}