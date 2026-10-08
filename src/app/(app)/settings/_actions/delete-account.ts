"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";

export async function deleteAccount(formData: FormData): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const confirmation = formData.get("confirmation")?.toString().trim().toLowerCase();

    if (confirmation !== appUser.email.toLowerCase()) {
      throw new Error("The email you typed doesn't match your account email.");
    }

    const userId = appUser.id;

    await prisma.$transaction(
      async (tx) => {
        /*
         * No relation in the schema uses onDelete: Cascade, so every table is
         * cleared by hand, children before parents.
         */

        // 1. Records that don't block anything else.
        await tx.auditLog.deleteMany({ where: { userId } });

        // 2. Rows that point at transactions, bills, goals and debts.
        await tx.billPayment.deleteMany({ where: { userId } });
        await tx.savingsContribution.deleteMany({ where: { userId } });
        await tx.debtPayment.deleteMany({ where: { userId } });

        // 3. Transactions (they point at accounts and categories).
        await tx.transaction.deleteMany({ where: { userId } });

        // 4. Parents of the payment rows, plus budgets.
        await tx.bill.deleteMany({ where: { userId } });
        await tx.savingsGoal.deleteMany({ where: { userId } });
        await tx.debt.deleteMany({ where: { userId } });
        await tx.budget.deleteMany({ where: { userId } });

        // 5. Categories and accounts.
        await tx.category.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });

        // 6. One-to-one user data, then the user itself.
        await tx.profile.deleteMany({ where: { userId } });
        await tx.userPreference.deleteMany({ where: { userId } });
        await tx.appUser.delete({ where: { id: userId } });

        /*
         * 7. Delete the Clerk user LAST, inside the transaction. If Clerk
         *    fails, this throws and everything above is rolled back, so the
         *    user never ends up with a login but no data (which would make
         *    getCurrentAppUser silently create a fresh empty account).
         *    Deleting the Clerk user also revokes their sessions.
         */
        const clerk = await clerkClient();
        await clerk.users.deleteUser(appUser.authProviderUserId);
      },
      { timeout: 30_000, maxWait: 10_000 },
    );

    // No revalidatePath and no redirect() here: the user no longer exists, and
    // redirect() would be swallowed by the catch below. The client navigates away.
    return actionSuccess("Your account and all its data were permanently deleted.");
  } catch (error) {
    return actionError(error, "Could not delete your account.");
  }
}
