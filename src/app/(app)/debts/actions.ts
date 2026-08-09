"use server";

import { revalidatePath } from "next/cache";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createDebt(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const rawName = formData.get("name")?.toString();
  const lenderName = formData.get("lenderName")?.toString().trim();
  const originalAmountValue = formData.get("originalAmount")?.toString();
  const minimumPaymentValue = formData.get("minimumPayment")?.toString();
  const dueDateValue = formData.get("dueDate")?.toString();
  const note = formData.get("note")?.toString().trim();

  if (!rawName?.trim()) {
    throw new Error("Debt name is required.");
  }

  if (!originalAmountValue) {
    throw new Error("Original amount is required.");
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

  await prisma.debt.create({
    data: {
      userId: appUser.id,
      name,
      lenderName: lenderName || null,
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
}

export async function recordDebtPayment(formData: FormData) {
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
    throw new Error("Payment amount is required.");
  }

  const amountMinor = parseAmountToMinorUnits(amountValue);
  const paidAt = parseDateInputToTransactionDate(paidAtValue);

  await prisma.$transaction(async (tx) => {
    const debt = await tx.debt.findFirst({
      where: {
        id: debtId,
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
    });

    if (!debt) {
      throw new Error("Debt not found or cannot receive payments.");
    }

    if (amountMinor > debt.remainingAmountMinor) {
      throw new Error("Payment cannot be greater than the remaining debt.");
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

    if (account.currency !== debt.currency) {
      throw new Error("Debt currency does not match your account currency.");
    }

    const transaction = await tx.transaction.create({
      data: {
        userId: appUser.id,
        accountId: account.id,
        type: "EXPENSE",
        amountMinor,
        currency: debt.currency,
        transactionDate: paidAt,
        description: `${debt.name} debt payment`,
        note: note || null,
        sourceType: "DEBT_PAYMENT",
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
      where: {
        id: transaction.id,
      },
      data: {
        sourceId: debtPayment.id,
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

    const nextRemainingAmountMinor = debt.remainingAmountMinor - amountMinor;

    await tx.debt.update({
      where: {
        id: debt.id,
      },
      data: {
        remainingAmountMinor: nextRemainingAmountMinor,
        status:
          nextRemainingAmountMinor <= BigInt(0) ? "PAID_OFF" : "ACTIVE",
      },
    });
  });

  revalidatePath("/debts");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/expenses");
}

export async function archiveDebt(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const debtId = formData.get("debtId")?.toString();

  if (!debtId) {
    throw new Error("Debt ID is required.");
  }

  await prisma.debt.updateMany({
    where: {
      id: debtId,
      userId: appUser.id,
      deletedAt: null,
    },
    data: {
      status: "ARCHIVED",
      deletedAt: new Date(),
    },
  });

  revalidatePath("/debts");
  revalidatePath("/dashboard");
}