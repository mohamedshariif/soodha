"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/current-app-user";
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