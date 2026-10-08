"use server";

import { revalidatePath } from "next/cache";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import type { DebtDirection } from "@/generated/prisma/enums";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function parseDirection(value: FormDataEntryValue | null): DebtDirection {
  return value === "OWED_TO_ME" ? "OWED_TO_ME" : "I_OWE";
}

export async function createDebt(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const direction = parseDirection(formData.get("direction"));
    const rawName = formData.get("name")?.toString();
    const counterpartyName = formData.get("counterpartyName")?.toString().trim();
    const originalAmountValue = formData.get("originalAmount")?.toString();
    const minimumPaymentValue = formData.get("minimumPayment")?.toString();
    const dueDateValue = formData.get("dueDate")?.toString();
    const note = formData.get("note")?.toString().trim();

    if (!rawName?.trim()) {
      throw new Error("Name is required.");
    }
    if (!originalAmountValue) {
      throw new Error("Amount is required.");
    }

    const name = normalizeText(rawName);
    const originalAmountMinor = parseAmountToMinorUnits(originalAmountValue);
    const minimumPaymentMinor = minimumPaymentValue?.trim()
      ? parseAmountToMinorUnits(minimumPaymentValue)
      : null;
    const dueDate = dueDateValue
      ? parseDateInputToTransactionDate(dueDateValue)
      : null;

    const account = await prisma.account.findFirst({
      where: { userId: appUser.id, isDefault: true, status: "ACTIVE", deletedAt: null },
    });
    if (!account) {
      throw new Error("Default account not found.");
    }

    await prisma.debt.create({
      data: {
        userId: appUser.id,
        direction,
        name,
        lenderName: counterpartyName || null,
        originalAmountMinor,
        remainingAmountMinor: originalAmountMinor,
        currency: account.currency,
        dueDate,
        minimumPaymentMinor,
        note: note || null,
        status: "ACTIVE",
      },
    });

    revalidatePath("/debts");
    revalidatePath("/dashboard");

    return actionSuccess(`${name} was added.`);
  } catch (error) {
    return actionError(error, "Could not add debt");
  }
}

export async function recordDebtPayment(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();
    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const debtId = formData.get("debtId")?.toString();
    const amountValue = formData.get("amount")?.toString();
    const paidAtValue = formData.get("paidAt")?.toString();
    const note = formData.get("note")?.toString().trim();

    if (!debtId) {
      throw new Error("Debt ID is required.");
    }
    if (!amountValue) {
      throw new Error("Amount is required.");
    }

    const amountMinor = parseAmountToMinorUnits(amountValue);
    const paidAt = parseDateInputToTransactionDate(paidAtValue);

    await prisma.$transaction(async (tx) => {
      const debt = await tx.debt.findFirst({
        where: { id: debtId, userId: appUser.id, status: "ACTIVE", deletedAt: null },
      });
      if (!debt) {
        throw new Error("Debt not found or cannot receive payments.");
      }
      if (amountMinor > debt.remainingAmountMinor) {
        throw new Error("Amount cannot be greater than the remaining balance.");
      }

      const account = await tx.account.findFirst({
        where: { userId: appUser.id, isDefault: true, status: "ACTIVE", deletedAt: null },
      });
      if (!account) {
        throw new Error("Default account not found.");
      }
      if (account.currency !== debt.currency) {
        throw new Error("Debt currency does not match your account currency.");
      }

      // I_OWE: paying someone back is money leaving your account (expense).
      // OWED_TO_ME: collecting from someone is money entering it (income).
      const isPayable = debt.direction === "I_OWE";

      const transaction = await tx.transaction.create({
        data: {
          userId: appUser.id,
          accountId: account.id,
          type: isPayable ? "EXPENSE" : "INCOME",
          amountMinor,
          currency: debt.currency,
          transactionDate: paidAt,
          description: isPayable
            ? `${debt.name} debt payment`
            : `${debt.name} debt collection`,
          note: note || null,
          sourceType: isPayable ? "DEBT_PAYMENT" : "DEBT_COLLECTION",
          status: "ACTIVE",
        },
      });

      const debtPayment = await tx.debtPayment.create({
        data: {
          userId: appUser.id,
          debtId: debt.id,
          transactionId: transaction.id,
          amountMinor,
          currency: debt.currency,
          paidAt,
          note: note || null,
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { sourceId: debtPayment.id },
      });

      await tx.account.update({
        where: { id: account.id },
        data: {
          currentBalanceMinor: isPayable
            ? { decrement: amountMinor }
            : { increment: amountMinor },
        },
      });

      const nextRemainingAmountMinor = debt.remainingAmountMinor - amountMinor;

      await tx.debt.update({
        where: { id: debt.id },
        data: {
          remainingAmountMinor: nextRemainingAmountMinor,
          status: nextRemainingAmountMinor <= BigInt(0) ? "PAID_OFF" : "ACTIVE",
        },
      });
    });

    revalidatePath("/debts");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/expenses");
    revalidatePath("/income");

    return actionSuccess("Recorded.");
  } catch (error) {
    return actionError(error, "Could not record this");
  }
}

export async function removeDebt(formData: FormData): Promise<ActionResult> {
  try{
    const appUser = await getCurrentAppUser();
    if(!appUser) throw new Error("You must be signed in.");

    const debtId = formData.get("debtId")?.toString();
    if (!debtId) throw new Error("Debt id is required.");

    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: appUser.id, deletedAt: null},
    });

    if (!debt) throw new Error("Debt not found");

    const debtPaymentCount = await prisma.debtPayment.count({
      where: { debtId: debt.id },
    });

    if (debtPaymentCount > 0) {
      await prisma.debt.update({
        where: { id: debt.id },
        data: { status: "ARCHIVED", deletedAt: new Date()},
      });

      revalidatePath("/debts");
      revalidatePath("/dashboard");

      return actionSuccess(`"${debt.name}" was archived since it has payment history.`);
    }

    await prisma.debt.delete({ where: {id: debt.id } });

    revalidatePath("/debts");
    revalidatePath("/dashboard");

    return actionSuccess(`"${debt.name}" was deleted.`)

  } catch (error) {
    return actionError(error, "Could not remove debt.");
  }

}
