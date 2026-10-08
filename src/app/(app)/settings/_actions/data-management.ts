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

export async function resetMonth(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const monthValue = formData.get("month")?.toString();

    if (!monthValue) {
      throw new Error("Month is required.");
    }

    const { periodStart, periodEnd } =
      parseMonthInputToBudgetPeriod(monthValue);

    const result = await prisma.$transaction(async (tx) => {
      /*
       * 1. Find every transaction in the selected month.
       */
      const transactions = await tx.transaction.findMany({
        where: {
          userId: appUser.id,
          transactionDate: {
            gte: periodStart,
            lt: periodEnd,
          },
        },
        select: {
          id: true,
        },
      });

      const transactionIds = transactions.map((t) => t.id);

      /*
       * 2. Capture affected bill payments before deleting them.
       */
      const affectedBillPayments =
        transactionIds.length > 0
          ? await tx.billPayment.findMany({
            where: {
              userId: appUser.id,
              transactionId: {
                in: transactionIds,
              },
            },
            select: {
              billId: true,
              dueDate: true,
            },
          })
          : [];

      const affectedBillIds = [
        ...new Set(affectedBillPayments.map((p) => p.billId)),
      ];

      /*
       * 3. Delete dependent records first.
       */
      if (transactionIds.length > 0) {
        await tx.billPayment.deleteMany({
          where: {
            userId: appUser.id,
            transactionId: { in: transactionIds },
          },
        });

        await tx.savingsContribution.deleteMany({
          where: {
            userId: appUser.id,
            transactionId: { in: transactionIds },
          },
        });

        await tx.debtPayment.deleteMany({
          where: {
            userId: appUser.id,
            transactionId: { in: transactionIds },
          },
        });

        await tx.transaction.deleteMany({
          where: {
            userId: appUser.id,
            id: { in: transactionIds },
          },
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
        where: {
          userId: appUser.id,
          status: "ACTIVE",
          deletedAt: null,
        },
        select: {
          accountId: true,
          type: true,
          amountMinor: true,
          sourceType: true,
        },
      });

      const calculatedBalances = new Map<string, bigint>();

      for (const account of accounts) {
        calculatedBalances.set(account.id, account.openingBalanceMinor);
      }

      for (const transaction of remainingTransactions) {
        const currentBalance =
          calculatedBalances.get(transaction.accountId) ?? 0n;

        let balanceChange = 0n;

        if (transaction.type === "INCOME") {
          balanceChange = transaction.amountMinor;
        } else if (transaction.type === "EXPENSE") {
          balanceChange = -transaction.amountMinor;
        } else if (
          transaction.type === "TRANSFER" &&
          transaction.sourceType === "SAVINGS_CONTRIBUTION"
        ) {
          balanceChange = -transaction.amountMinor;
        }

        calculatedBalances.set(
          transaction.accountId,
          currentBalance + balanceChange,
        );
      }

      // Parallelize account updates
      await Promise.all(
        accounts.map((account) =>
          tx.account.update({
            where: { id: account.id },
            data: {
              currentBalanceMinor:
                calculatedBalances.get(account.id) ??
                account.openingBalanceMinor,
            },
          }),
        ),
      );

      /*
       * 6. Recalculate savings goals.
       */
      const savingsGoals = await tx.savingsGoal.findMany({
        where: { userId: appUser.id },
        select: { id: true, targetAmountMinor: true },
      });

      const contributions = await tx.savingsContribution.findMany({
        where: { userId: appUser.id },
        select: { savingsGoalId: true, amountMinor: true },
      });

      const savingsTotals = new Map<string, bigint>();

      for (const contribution of contributions) {
        const current = savingsTotals.get(contribution.savingsGoalId) ?? 0n;
        savingsTotals.set(
          contribution.savingsGoalId,
          current + contribution.amountMinor,
        );
      }

      // Parallelize savings updates
      await Promise.all(
        savingsGoals.map((goal) => {
          const currentAmount = savingsTotals.get(goal.id) ?? 0n;
          return tx.savingsGoal.update({
            where: { id: goal.id },
            data: {
              currentAmountMinor: currentAmount,
              status:
                currentAmount >= goal.targetAmountMinor
                  ? "COMPLETED"
                  : "ACTIVE",
            },
          });
        }),
      );

      /*
       * 7. Recalculate debts.
       */
      const debts = await tx.debt.findMany({
        where: { userId: appUser.id },
        select: { id: true, originalAmountMinor: true },
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

      // Parallelize debt updates
      await Promise.all(
        debts.map((debt) => {
          const paidAmount = debtTotals.get(debt.id) ?? 0n;
          const remainingAmount = debt.originalAmountMinor - paidAmount;
          return tx.debt.update({
            where: { id: debt.id },
            data: {
              remainingAmountMinor:
                remainingAmount < 0n ? 0n : remainingAmount,
              status: remainingAmount <= 0n ? "PAID_OFF" : "ACTIVE",
            },
          });
        }),
      );

      /*
       * 8. Restore affected bills (Batched & Parallelized).
       */
      if (affectedBillIds.length > 0) {
        const bills = await tx.bill.findMany({
          where: {
            id: { in: affectedBillIds },
            userId: appUser.id,
          },
          select: {
            id: true,
            repeatType: true,
          },
        });

        // Fetch all remaining payments for all affected bills in one query
        const remainingPayments = await tx.billPayment.findMany({
          where: {
            billId: { in: affectedBillIds },
          },
          orderBy: [{ dueDate: "desc" }, { paidAt: "desc" }],
          select: {
            billId: true,
            dueDate: true,
          },
        });

        // Group the latest remaining payment per bill in memory
        const latestPaymentMap = new Map<string, Date>();
        for (const payment of remainingPayments) {
          if (!latestPaymentMap.has(payment.billId)) {
            latestPaymentMap.set(payment.billId, payment.dueDate);
          }
        }

        await Promise.all(
          bills.map((bill) => {
            const latestDueDate = latestPaymentMap.get(bill.id);

            if (latestDueDate) {
              const nextDueDate = getNextDueDate(
                latestDueDate,
                bill.repeatType,
              );

              if (nextDueDate) {
                return tx.bill.update({
                  where: { id: bill.id },
                  data: {
                    nextDueDate,
                    status: "ACTIVE",
                    deletedAt: null,
                  },
                });
              }

              // One-time bill: the remaining payment represents
              // the current/last occurrence.
              return tx.bill.update({
                where: { id: bill.id },
                data: {
                  nextDueDate: latestDueDate,
                  status: "ARCHIVED",
                  deletedAt: new Date(),
                },
              });
            }

            const resetPayment = affectedBillPayments.find(
              (payment) => payment.billId === bill.id,
            );

            if (!resetPayment) {
              return undefined;
            }

            return tx.bill.update({
              where: { id: bill.id },
              data: {
                nextDueDate: resetPayment.dueDate,
                status: "ACTIVE",
                deletedAt: null,
              },
            });
          }),
        );
      }

      return {
        transactionCount: transactionIds.length,
      };
    });

    /*
     * Refresh all layouts and routes across the app in one step.
     */
    revalidatePath("/", "layout");

    return actionSuccess(
      `The selected month was reset. ${result.transactionCount} transaction${result.transactionCount === 1 ? "" : "s"
      } and related records were removed.`,
    );
  } catch (error) {
    return actionError(
      error,
      "Could not reset the selected month.",
    );
  }
}