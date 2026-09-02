"use server";

import { revalidatePath } from "next/cache";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createSavingsGoal(
  formData: FormData,
): Promise<ActionResult> {
  try {
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

    return actionSuccess(`"${name}" was created successfully.`);
  } catch (error) {
    return actionError(error, "Could not create savings goal.");
  }
}

export async function addSavingsContribution(
  formData: FormData,
): Promise<ActionResult> {
  try {
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

    const goal = await prisma.savingsGoal.findFirst({
      where: {
        id: savingsGoalId,
        userId: appUser.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new Error("Svaings goal not found or already deleted.");
    }

    const amountMinor = parseAmountToMinorUnits(amountValue);
    const contributionDate = parseDateInputToTransactionDate(
      contributionDateValue,
    );

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
        throw new Error(
          "Savings goal not found or cannot receive contributions.",
        );
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
        throw new Error(
          "Savings goal currency does not match your account currency.",
        );
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

    return actionSuccess(`Contribution added to "${goal.name}".`);
  } catch (error) {
    return actionError(error, "Could not add savings contribution.");
  }
}

export async function archiveSavingsGoal(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const savingsGoalId = formData.get("savingsGoalId")?.toString();

    if (!savingsGoalId) {
      throw new Error("Savings goal ID is required.");
    }

    const goal = await prisma.savingsGoal.findFirst({
      where: {
        id: savingsGoalId,
        userId: appUser.id,
        deletedAt: null,
      },
    });

    if (!goal) {
      throw new Error("Goal not found or already deleted.");
    }

    const contributionCount = await prisma.savingsContribution.count({
      where: { savingsGoalId: goal.id },
    });

    if (contributionCount > 0) {
      await prisma.savingsGoal.update({
        where: { id: goal.id },
        data: {
          status: "ARCHIVED",
          deletedAt: new Date(),
        },
      });

      revalidatePath("/savings");
      revalidatePath("/dashboard");

      return actionSuccess(
        `"${goal.name}" was archived since it has contribution history.`,
      );
    }

    await prisma.savingsGoal.delete({
      where: { id: goal.id },
    });

    revalidatePath("/savings");
    revalidatePath("/dashboard");

    return actionSuccess(`"${goal.name}" was deleted.`);
  } catch (error) {
    return actionError(error, "Could not remove savings goal.");
  }
}
