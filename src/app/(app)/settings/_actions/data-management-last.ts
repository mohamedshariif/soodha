"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { getNextDueDate } from "@/lib/bills";
import { parseMonthInputToBudgetPeriod } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";

export async function resetMonth(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const monthValue = formData.get("month")?.toString();

    if (!monthValue) {
      throw new Error("Month is required.");
    }

    const { periodStart, periodEnd } = parseMonthInputToBudgetPeriod(monthValue);

    const result = await prisma.$transaction(
      async (tx) => {
        /*
         * 1. Find every transaction in the selected month.
         */
        const transactions = await tx.transaction.findMany({
          where: {
            userId: appUser.id,
            transactionDate: { gte: periodStart, lt: periodEnd },
          },
          select: { id: true },
        });

        const transactionIds = transactions.map((transaction) => transaction.id);

        /*
         * 2. Capture affected bill payments before deleting them.
         */
        const affectedBillPayments = transactionIds.length > 0
          ? await tx.billPayment.findMany({
              where: { userId: appUser.id, transactionId: { in: transactionIds } },
              select: { billId: true, dueDate: true },
            })
          : [];

        const affectedBillIds = [...new Set(affectedBillPayments.map((payment) => payment.billId))];

        /*
         * 3. Delete dependent records first.
         */
        if (transactionIds.length > 0) {
          await tx.billPayment.deleteMany({
            where: { userId: appUser.id, transactionId: { in: transactionIds } },
          });

          await tx.savingsContribution.deleteMany({
            where: { userId: appUser.id, transactionId: { in: transactionIds } },
          });

          await tx.debtPayment.deleteMany({
            where: { userId: appUser.id, transactionId: { in: transactionIds } },
          });

          await tx.transaction.deleteMany({
            where: { userId: appUser.id, id: { in: transactionIds } },
          });
        }

        /*
         * 4. Delete monthly budgets for the selected month.
         */
        await tx.budget.deleteMany({
          where: {
            userId: appUser.id,
            period: "MONTHLY",
            periodStart,
            periodEnd,
          },
        });

        /*
         * 5. Recalculate account balances.
         */
        const accounts = await tx.account.findMany({
          where: { userId: appUser.id },
          select: { id: true, openingBalanceMinor: true },
        });

        const remainingTransactions = await tx.transaction.findMany({
          where: { userId: appUser.id, status: "ACTIVE", deletedAt: null },
          select: { accountId: true, type: true, amountMinor: true, sourceType: true },
        });

        const calculatedBalances = new Map<string, bigint>();

        for (const account of accounts) {
          calculatedBalances.set(account.id, account.openingBalanceMinor);
        }

        for (const transaction of remainingTransactions) {
          const currentBalance = calculatedBalances.get(transaction.accountId) ?? 0n;
          let balanceChange = 0n;

          if (transaction.type === "INCOME") {
            balanceChange = transaction.amountMinor;
          } else if (transaction.type === "EXPENSE") {
            balanceChange = -transaction.amountMinor;
          } else if (transaction.type === "TRANSFER" && transaction.sourceType === "SAVINGS_CONTRIBUTION") {
            balanceChange = -transaction.amountMinor;
          }

          calculatedBalances.set(transaction.accountId, currentBalance + balanceChange);
        }

        await Promise.all(
          accounts.map((account) =>
            tx.account.update({
              where: { id: account.id },
              data: { currentBalanceMinor: calculatedBalances.get(account.id) ?? account.openingBalanceMinor },
            }),
          ),
        );

        /*
         * 6. Recalculate savings goals.
         */
        const savingsGoals = await tx.savingsGoal.findMany({
          where: { userId: appUser.id },
          select: { id: true, targetAmountMinor: true, status: true },
        });

        const contributions = await tx.savingsContribution.findMany({
          where: { userId: appUser.id },
          select: { savingsGoalId: true, amountMinor: true },
        });

        const savingsTotals = new Map<string, bigint>();

        for (const contribution of contributions) {
          const current = savingsTotals.get(contribution.savingsGoalId) ?? 0n;
          savingsTotals.set(contribution.savingsGoalId, current + contribution.amountMinor);
        }

        await Promise.all(
          savingsGoals.map((goal) => {
            const currentAmount = savingsTotals.get(goal.id) ?? 0n;
            const shouldUpdateStatus = goal.status === "ACTIVE" || goal.status === "COMPLETED";

            return tx.savingsGoal.update({
              where: { id: goal.id },
              data: {
                currentAmountMinor: currentAmount,
                ...(shouldUpdateStatus
                  ? { status: currentAmount >= goal.targetAmountMinor ? "COMPLETED" : "ACTIVE" }
                  : {}),
              },
            });
          }),
        );

        /*
         * 7. Recalculate debts.
         */
        const debts = await tx.debt.findMany({
          where: { userId: appUser.id },
          select: { id: true, originalAmountMinor: true, status: true },
        });

        const debtPayments = await tx.debtPayment.findMany({
          where: { userId: appUser.id },
          select: { debtId: true, amountMinor: true },
        });

        const debtTotals = new Map<string, bigint>();

        for (const payment of debtPayments) {
          const current = debtTotals.get(payment.debtId) ?? 0n;
          debtTotals.set(payment.debtId, current + payment.amountMinor);
        }

        await Promise.all(
          debts.map((debt) => {
            const paidAmount = debtTotals.get(debt.id) ?? 0n;
            const remainingAmount = debt.originalAmountMinor - paidAmount;
            const normalizedRemainingAmount = remainingAmount < 0n ? 0n : remainingAmount;
            const shouldUpdateStatus = debt.status === "ACTIVE" || debt.status === "PAID_OFF";

            return tx.debt.update({
              where: { id: debt.id },
              data: {
                remainingAmountMinor: normalizedRemainingAmount,
                ...(shouldUpdateStatus
                  ? { status: normalizedRemainingAmount <= 0n ? "PAID_OFF" : "ACTIVE" }
                  : {}),
              },
            });
          }),
        );

        /*
         * 8. Restore affected bills.
         */
        if (affectedBillIds.length > 0) {
          const bills = await tx.bill.findMany({
            where: { id: { in: affectedBillIds }, userId: appUser.id },
            select: { id: true, repeatType: true, status: true },
          });

          const remainingPayments = await tx.billPayment.findMany({
            where: { userId: appUser.id, billId: { in: affectedBillIds } },
            orderBy: [{ dueDate: "desc" }, { paidAt: "desc" }],
            select: { billId: true, dueDate: true },
          });

          const latestPaymentMap = new Map<string, Date>();

          for (const payment of remainingPayments) {
            if (!latestPaymentMap.has(payment.billId)) {
              latestPaymentMap.set(payment.billId, payment.dueDate);
            }
          }

          const resetPaymentMap = new Map<string, Date>();

          for (const payment of affectedBillPayments) {
            if (!resetPaymentMap.has(payment.billId)) {
              resetPaymentMap.set(payment.billId, payment.dueDate);
            }
          }

          await Promise.all(
            bills.map((bill) => {
              const latestDueDate = latestPaymentMap.get(bill.id);

              if (latestDueDate) {
                const nextDueDate = getNextDueDate(latestDueDate, bill.repeatType);

                if (nextDueDate && bill.status === "ACTIVE") {
                  return tx.bill.update({
                    where: { id: bill.id },
                    data: { nextDueDate },
                  });
                }

                return undefined;
              }

              const resetDueDate = resetPaymentMap.get(bill.id);

              if (!resetDueDate) {
                return undefined;
              }

              return tx.bill.update({
                where: { id: bill.id },
                data: {
                  nextDueDate: resetDueDate,
                  status: "ACTIVE",
                  deletedAt: null,
                },
              });
            }),
          );
        }

        return { transactionCount: transactionIds.length };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    revalidatePath("/", "layout");

    return actionSuccess(
      `The selected month was reset. ${result.transactionCount} transaction${
        result.transactionCount === 1 ? "" : "s"
      } and related records were removed.`,
    );
  } catch (error) {
    return actionError(error, "Could not reset the selected month.");
  }
}
