"use server";

import { revalidatePath } from "next/cache";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createSavingsGoal(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const rawName = formData.get("name")?.toString();
  const targetAmountValue = formData.get("targetAmount")?.toString();
  const deadlineValue = formData.get("deadline")?.toString();
  const note = formData.get("note")?.toString().trim();

  if (!rawName?.trim()) {
    throw new Error("Goal name is required.");
  }

  if (!targetAmountValue) {
    throw new Error("Target amount is required.");
  }

  const name = normalizeName(rawName);
  const targetAmountMinor = parseAmountToMinorUnits(targetAmountValue);
  const deadline = deadlineValue
    ? parseDateInputToTransactionDate(deadlineValue)
    : null;

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

  await prisma.savingsGoal.create({
    data: {
      userId: appUser.id,
      name,
      targetAmountMinor,
      currentAmountMinor: BigInt(0),
      currency: account.currency,
      deadline,
      note: note || null,
      status: "ACTIVE",
    },
  });

  revalidatePath("/savings");
  revalidatePath("/dashboard");
}

export async function addSavingsContribution(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const savingsGoalId = formData.get("savingsGoalId")?.toString();
  const amountValue = formData.get("amount")?.toString();
  const contributionDateValue = formData.get("contributionDate")?.toString();
  const note = formData.get("note")?.toString().trim();

  if (!savingsGoalId) {
    throw new Error("Savings goal ID is required.");
  }

  if (!amountValue) {
    throw new Error("Contribution amount is required.");
  }

  const amountMinor = parseAmountToMinorUnits(amountValue);
  const contributionDate =
    parseDateInputToTransactionDate(contributionDateValue);

  await prisma.$transaction(async (tx) => {
    const savingsGoal = await tx.savingsGoal.findFirst({
      where: {
        id: savingsGoalId,
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!savingsGoal) {
      throw new Error("Savings goal not found or cannot receive contributions.");
    }

    const account = await tx.account.findFirst({
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

    if (account.currency !== savingsGoal.currency) {
      throw new Error("Savings goal currency does not match your account currency.");
    }

    const transaction = await tx.transaction.create({
      data: {
        userId: appUser.id,
        accountId: account.id,
        type: "TRANSFER",
        amountMinor,
        currency: savingsGoal.currency,
        transactionDate: contributionDate,
        description: `${savingsGoal.name} savings contribution`,
        note: note || null,
        sourceType: "SAVINGS_CONTRIBUTION",
        status: "ACTIVE",
      },
    });

    const contribution = await tx.savingsContribution.create({
      data: {
        userId: appUser.id,
        savingsGoalId: savingsGoal.id,
        transactionId: transaction.id,
        amountMinor,
        currency: savingsGoal.currency,
        contributionDate,
        note: note || null,
      },
    });

    await tx.transaction.update({
      where: {
        id: transaction.id,
      },
      data: {
        sourceId: contribution.id,
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

    const nextCurrentAmountMinor =
      savingsGoal.currentAmountMinor + amountMinor;

    await tx.savingsGoal.update({
      where: {
        id: savingsGoal.id,
      },
      data: {
        currentAmountMinor: {
          increment: amountMinor,
        },
        status:
          nextCurrentAmountMinor >= savingsGoal.targetAmountMinor
            ? "COMPLETED"
            : "ACTIVE",
      },
    });
  });

  revalidatePath("/savings");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function archiveSavingsGoal(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const savingsGoalId = formData.get("savingsGoalId")?.toString();

  if (!savingsGoalId) {
    throw new Error("Savings goal ID is required.");
  }

  await prisma.savingsGoal.updateMany({
    where: {
      id: savingsGoalId,
      userId: appUser.id,
      deletedAt: null,
    },
    data: {
      status: "ARCHIVED",
      deletedAt: new Date(),
    },
  });

  revalidatePath("/savings");
  revalidatePath("/dashboard");
}