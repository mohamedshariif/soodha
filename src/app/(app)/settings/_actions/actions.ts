"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/action-result";

const supportedCurrencies = new Set(["USD", "SOS", "EUR", "TRY"]);

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function updateProfileDisplayName(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const rawFullName = formData.get("fullName")?.toString();

    if (!rawFullName?.trim()) {
      throw new Error("Display name is required.");
    }

    const fullName = normalizeText(rawFullName);

    await prisma.profile.upsert({
      where: { userId: appUser.id },
      update: { fullName },
      create: { userId: appUser.id, fullName },
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return actionSuccess("Profile updated.");
  } catch (error) {
    return actionError(error, "Could not update profile.");
  }
}

export async function updateDefaultCurrency(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const appUser = await getCurrentAppUser();

    if (!appUser) {
      throw new Error("You must be signed in.");
    }

    const currency = formData.get("defaultCurrency")?.toString();

    if (!currency || !supportedCurrencies.has(currency)) {
      throw new Error("Unsupported currency.");
    }

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await prisma.$transaction(
          async (tx) => {
            const [transactionCount, defaultAccount] =
              await Promise.all([
                tx.transaction.count({
                  where: {
                    userId: appUser.id,
                    deletedAt: null,
                  },
                }),

                tx.account.findFirst({
                  where: {
                    userId: appUser.id,
                    isDefault: true,
                    status: "ACTIVE",
                    deletedAt: null,
                  },
                }),
              ]);

            const accountBalanceMinor =
              defaultAccount?.currentBalanceMinor ?? BigInt(0);

            if (
              transactionCount > 0 ||
              accountBalanceMinor !== BigInt(0)
            ) {
              throw new Error(
                "Currency can only be changed before transactions or account balance exist.",
              );
            }

            await tx.userPreference.upsert({
              where: { userId: appUser.id },
              update: { defaultCurrency: currency },
              create: {
                userId: appUser.id,
                defaultCurrency: currency,
                language: "en",
                theme: "SYSTEM",
              },
            });

            await tx.account.updateMany({
              where: {
                userId: appUser.id,
                isDefault: true,
                status: "ACTIVE",
                deletedAt: null,
              },
              data: { currency },
            });
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel.Serializable,
          },
        );

        revalidatePath("/settings");
        revalidatePath("/dashboard");
        revalidatePath("/transactions");

        return actionSuccess(
          `Default currency set to ${currency}.`,
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034" &&
          attempt < maxRetries
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error("Could not safely update currency.");
  } catch (error) {
    return actionError(error, "Could not update currency.");
  }
}