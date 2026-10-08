"use server";

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

const CONFIRMATION_TEXT = "RESET";

export async function resetMonth(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    if (formData.get("confirmation")?.toString() !== CONFIRMATION_TEXT) {
      throw new Error(`Type ${CONFIRMATION_TEXT} to confirm.`);
    }

    const monthValue = formData.get("month")?.toString();

    if (!monthValue) {
      throw new Error("Month is required.");
    }

    const { periodStart, periodEnd } = parseMonthInputToBudgetPeriod(monthValue);
    const userId = appUser.id;

    const result = await prisma.$transaction(
      async (tx) => {
        /*
         * 1. Find every transaction in the selected month
         *    (soft-deleted ones included, they get removed too).
         */
        const transactions = await tx.transaction.findMany({
          where: { userId, transactionDate: { gte: periodStart, lt: periodEnd } },
          select: { id: true },
        });

        const transactionIds = transactions.map((transaction) => transaction.id);

        /*
         * 2. Capture affected bill payments before deleting them.
         */
        const affectedBillPayments =
          transactionIds.length > 0
            ? await tx.billPayment.findMany({
                where: { userId, transactionId: { in: transactionIds } },
                select: { billId: true, dueDate: true },
              })
            : [];

        const affectedBillIds = [
          ...new Set(affectedBillPayments.map((payment) => payment.billId)),
        ];

        /*
         * 3. Delete dependent records first, then the transactions.
         */
        if (transactionIds.length > 0) {
          await tx.billPayment.deleteMany({
            where: { userId, transactionId: { in: transactionIds } },
          });
          await tx.savingsContribution.deleteMany({
            where: { userId, transactionId: { in: transactionIds } },
          });
          await tx.debtPayment.deleteMany({
            where: { userId, transactionId: { in: transactionIds } },
          });
          await tx.transaction.deleteMany({
            where: { userId, id: { in: transactionIds } },
          });
        }

        /*
         * 4. Delete the monthly budgets for the selected month.
         */
        await tx.budget.deleteMany({
          where: { userId, period: "MONTHLY", periodStart, periodEnd },
        });

        /*
         * 5. Recalculate account balances (aggregated in the database).
         */
        const accounts = await tx.account.findMany({
          where: { userId },
          select: { id: true, openingBalanceMinor: true, currentBalanceMinor: true },
        });

        const transactionTotals = await tx.transaction.groupBy({
          by: ["accountId", "type", "sourceType"],
          where: { userId, status: "ACTIVE", deletedAt: null },
          _sum: { amountMinor: true },
        });

        const balances = new Map<string, bigint>(
          accounts.map((account) => [account.id, account.openingBalanceMinor]),
        );

        for (const row of transactionTotals) {
          const amount = row._sum.amountMinor ?? 0n;
          let change = 0n;

          if (row.type === "INCOME") {
            change = amount;
          } else if (row.type === "EXPENSE") {
            change = -amount;
          } else if (row.type === "TRANSFER" && row.sourceType === "SAVINGS_CONTRIBUTION") {
            change = -amount;
          }

          balances.set(row.accountId, (balances.get(row.accountId) ?? 0n) + change);
        }

        for (const account of accounts) {
          const balance = balances.get(account.id) ?? account.openingBalanceMinor;

          if (balance !== account.currentBalanceMinor) {
            await tx.account.update({
              where: { id: account.id },
              data: { currentBalanceMinor: balance },
            });
          }
        }

        /*
         * 6. Recalculate savings goals.
         */
        const savingsGoals = await tx.savingsGoal.findMany({
          where: { userId },
          select: { id: true, targetAmountMinor: true, currentAmountMinor: true, status: true },
        });

        const contributionTotals = await tx.savingsContribution.groupBy({
          by: ["savingsGoalId"],
          where: { userId },
          _sum: { amountMinor: true },
        });

        const savedByGoal = new Map(
          contributionTotals.map((row) => [row.savingsGoalId, row._sum.amountMinor ?? 0n]),
        );

        for (const goal of savingsGoals) {
          const currentAmount = savedByGoal.get(goal.id) ?? 0n;
          const canChangeStatus = goal.status === "ACTIVE" || goal.status === "COMPLETED";
          const status = canChangeStatus
            ? currentAmount >= goal.targetAmountMinor
              ? "COMPLETED"
              : "ACTIVE"
            : goal.status;

          if (currentAmount !== goal.currentAmountMinor || status !== goal.status) {
            await tx.savingsGoal.update({
              where: { id: goal.id },
              data: { currentAmountMinor: currentAmount, status },
            });
          }
        }

        /*
         * 7. Recalculate debts.
         */
        const debts = await tx.debt.findMany({
          where: { userId },
          select: { id: true, originalAmountMinor: true, remainingAmountMinor: true, status: true },
        });

        const paymentTotals = await tx.debtPayment.groupBy({
          by: ["debtId"],
          where: { userId },
          _sum: { amountMinor: true },
        });

        const paidByDebt = new Map(
          paymentTotals.map((row) => [row.debtId, row._sum.amountMinor ?? 0n]),
        );

        for (const debt of debts) {
          const paid = paidByDebt.get(debt.id) ?? 0n;
          const remaining = debt.originalAmountMinor - paid;
          const remainingAmount = remaining < 0n ? 0n : remaining;
          const canChangeStatus = debt.status === "ACTIVE" || debt.status === "PAID_OFF";
          const status = canChangeStatus
            ? remainingAmount === 0n
              ? "PAID_OFF"
              : "ACTIVE"
            : debt.status;

          if (remainingAmount !== debt.remainingAmountMinor || status !== debt.status) {
            await tx.debt.update({
              where: { id: debt.id },
              data: { remainingAmountMinor: remainingAmount, status },
            });
          }
        }

        /*
         * 8. Restore affected bills.
         */
        if (affectedBillIds.length > 0) {
          const bills = await tx.bill.findMany({
            where: { id: { in: affectedBillIds }, userId },
            select: { id: true, repeatType: true, status: true },
          });

          const remainingPayments = await tx.billPayment.findMany({
            where: { userId, billId: { in: affectedBillIds } },
            orderBy: [{ dueDate: "desc" }, { paidAt: "desc" }],
            select: { billId: true, dueDate: true },
          });

          // Latest payment still on record for each bill (rows are sorted newest first).
          const latestRemaining = new Map<string, Date>();

          for (const payment of remainingPayments) {
            if (!latestRemaining.has(payment.billId)) {
              latestRemaining.set(payment.billId, payment.dueDate);
            }
          }

          // Earliest payment we just removed for each bill.
          const earliestRemoved = new Map<string, Date>();

          for (const payment of affectedBillPayments) {
            const current = earliestRemoved.get(payment.billId);

            if (!current || payment.dueDate < current) {
              earliestRemoved.set(payment.billId, payment.dueDate);
            }
          }

          for (const bill of bills) {
            const latestDueDate = latestRemaining.get(bill.id);

            if (latestDueDate) {
              const nextDueDate = getNextDueDate(latestDueDate, bill.repeatType);

              if (nextDueDate && bill.status === "ACTIVE") {
                await tx.bill.update({ where: { id: bill.id }, data: { nextDueDate } });
              }

              continue;
            }

            const restoredDueDate = earliestRemoved.get(bill.id);

            if (restoredDueDate) {
              await tx.bill.update({
                where: { id: bill.id },
                data: { nextDueDate: restoredDueDate, status: "ACTIVE", deletedAt: null },
              });
            }
          }
        }

        return { transactionCount: transactionIds.length };
      },
      // Neon round-trips add up, the 5s default is too tight for a bulk reset.
      { timeout: 30_000, maxWait: 10_000 },
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
