"use server";

import { revalidatePath } from "next/cache";
import {
  formatDateForInput,
  getTodayDateInputValue,
  parseDateInputToTransactionDate,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";
import { 
  getNextDueDate,
  isRepeatType,
} from "@/lib/bills";

export async function createBill(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) throw new Error("You must be signed in.");

    const name = formData.get("name")?.toString().trim();
    const amountValue = formData.get("amount")?.toString();
    const categoryId = formData.get("categoryId")?.toString();
    const nextDueDateValue = formData.get("nextDueDate")?.toString();
    const repeatType = formData.get("repeatType");

    if (!name) throw new Error("Bill name is required.");
    if (!amountValue) throw new Error("Amount is requried.");
    if (!categoryId) throw new Error("Category is required.");
    if (!nextDueDateValue) throw new Error("Due date is required.");
    if (!isRepeatType(repeatType)) throw new Error("Repeat type is invalid.");

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

    if (!account) throw new Error("Default account not found.");

    if (!category) throw new Error("Expense category not found.");

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

    return actionSuccess(`${name} bill was added.`);
  } catch (error) {
    return actionError(error, "Failed to create bill.");
  }
}

export async function markBillAsPaid(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) throw new Error("You must be signed in.");

    const billId = formData.get("billId")?.toString();
    const expectedDueDateValue = formData.get("dueDate")?.toString();

    if (!billId) throw new Error("Bill ID is required.");
    if (!expectedDueDateValue) throw new Error("Bill due date is required.");

    const paymentDate = parseDateInputToTransactionDate(
      getTodayDateInputValue(),
    );

    const billName = await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findFirst({
        where: {
          id: billId,
          userId: appUser.id,
          status: "ACTIVE",
          deletedAt: null,
        },
      });

      if (!bill) throw new Error("Bill not found.");

      if (formatDateForInput(bill.nextDueDate) !== expectedDueDateValue) {
        throw new Error(
          "This bill was already updated. Refresh and try again.",
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

      if (!account) throw new Error("Default account not found.");

      const transaction = await tx.transaction.create({
        data: {
          userId: appUser.id,
          accountId: account.id,
          categoryId: bill.categoryId,
          type: "EXPENSE",
          amountMinor: bill.amountMinor,
          currency: bill.currency,
          transactionDate: paymentDate,
          description: `${bill.name} bill payment`,
          sourceType: "BILL_PAYMENT",
          status: "ACTIVE",
        },
      });

      const billPayment = await tx.billPayment.create({
        data: {
          userId: appUser.id,
          billId: bill.id,
          transactionId: transaction.id,
          dueDate: bill.nextDueDate,
          paidAt: new Date(),
          amountMinor: bill.amountMinor,
          currency: bill.currency,
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { sourceId: billPayment.id },
      });

      await tx.account.update({
        where: { id: account.id },
        data: { currentBalanceMinor: { decrement: bill.amountMinor } },
      });

      const nextDueDate = getNextDueDate(
        bill.nextDueDate,
        bill.repeatType,
      );

      if (nextDueDate) {
        await tx.bill.update({ where: { id: bill.id }, data: { nextDueDate } });
      } else {
        await tx.bill.update({
          where: { id: bill.id },
          data: { status: "ARCHIVED", deletedAt: new Date() },
        });
      }

      return bill.name;
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/expenses");
    revalidatePath("/budgets");

    return actionSuccess(`"${billName}" bill marked as paid.`);
  } catch (error) {
    return actionError(error, "Failed to mark bill as paid.");
  }
}

export async function removeBill(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) throw new Error("You must be signed in.");

    const billId = formData.get("billId")?.toString();

    if (!billId) throw new Error("Bill ID is required.");

    const bill = await prisma.bill.findFirst({
      where: { id: billId, userId: appUser.id, deletedAt: null },
    });

    if (!bill) throw new Error("Bill not found.");

    const paymentCount = await prisma.billPayment.count({
      where: { billId: bill.id },
    });

    if (paymentCount > 0) {
      await prisma.bill.update({
        where: { id: bill.id },
        data: { status: "ARCHIVED", deletedAt: new Date() },
      });

      revalidatePath("/bills");
      revalidatePath("/dashboard");

      return actionSuccess(
        `"${bill.name}" was archived since it has payment hsitory.`,
      );
    }

    await prisma.bill.delete({ where: { id: bill.id } });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return actionSuccess(`"${bill.name}" was deleted.`);
  } catch (error) {
    return actionError(error, "Could not remove bill.");
  }
}
