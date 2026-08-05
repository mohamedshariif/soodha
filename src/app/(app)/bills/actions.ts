"use server";

import { revalidatePath } from "next/cache";
import { parseDateInputToTransactionDate } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type RepeatType = "NONE" | "WEEKLY" | "MONTHLY" | "YEARLY";

function isRepeatType(value: FormDataEntryValue | null): value is RepeatType {
  return (
    value === "NONE" ||
    value === "WEEKLY" ||
    value === "MONTHLY" ||
    value === "YEARLY"
  );
}

export async function createBill(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const name = formData.get("name")?.toString().trim();
  const amountValue = formData.get("amount")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  const nextDueDateValue = formData.get("nextDueDate")?.toString();
  const repeatType = formData.get("repeatType");

  if (!name) {
    throw new Error("Bill name is required.");
  }

  if (!amountValue) {
    throw new Error("Amount is required.");
  }

  if (!categoryId) {
    throw new Error("Category is required.");
  }

  if (!nextDueDateValue) {
    throw new Error("Due date is required.");
  }

  if (!isRepeatType(repeatType)) {
    throw new Error("Repeat type is invalid.");
  }

  const amountMinor = parseAmountToMinorUnits(amountValue);
  const nextDueDate = parseDateInputToTransactionDate(nextDueDateValue);

  const [account, category] = await Promise.all([
    prisma.account.findFirst({
      where: {
        userId: appUser.id,
        isDefault: true,
        status: "ACTIVE",
        deletedAt: null,
      },
    }),

    prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: appUser.id,
        type: "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
      },
    }),
  ]);

  if (!account) {
    throw new Error("Default account not found.");
  }

  if (!category) {
    throw new Error("Expense category not found.");
  }

  await prisma.bill.create({
    data: {
      userId: appUser.id,
      categoryId: category.id,
      name,
      amountMinor,
      currency: account.currency,
      nextDueDate,
      repeatType,
      status: "ACTIVE",
    },
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");
}

export async function archiveBill(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const billId = formData.get("billId")?.toString();

  if (!billId) {
    throw new Error("Bill ID is required.");
  }

  await prisma.bill.updateMany({
    where: {
      id: billId,
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
    data: {
      status: "ARCHIVED",
      deletedAt: new Date(),
    },
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");
}