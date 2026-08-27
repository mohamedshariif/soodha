"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { MOBILE_MONEY_PROVIDERS, type MobileMoneyProvider } from "@/lib/mobile-money-providers";

const accountTypes = new Set(["CASH", "BANK", "MOBILE_MONEY"]);

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createAccount(formData: FormData): Promise<ActionResult> {
  try {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const rawName = formData.get("name")?.toString();
  const type = formData.get("type")?.toString();
  const providerValue = formData.get("provider")?.toString().trim();
  const openingBalanceValue = formData.get("openingBalance")?.toString();

  if (!rawName?.trim()) {
    throw new Error("Account name is required.");
  }

  if (!type || !accountTypes.has(type)) {
    throw new Error("Account type is invalid.");
  }

  const name = normalizeText(rawName);

  const existing = await prisma.account.findFirst({
    where: {
      userId: appUser.id,
      name,
      status: "ACTIVE",
      deletedAt: null
    },
  });

  if (existing) {
    throw new Error (`An account named "${name}" already exists.`);
  }

  let provider: string;

  if (type === "MOBILE_MONEY") {
    if (
        !providerValue ||
        !MOBILE_MONEY_PROVIDERS.includes(providerValue as MobileMoneyProvider)
      ) {
        throw new Error("Please select a mobile money provider.");
      }

      provider = providerValue;
    } else if (type === "CASH") {
      provider = "Cash";
    } else {
      // type === "BANK" (guaranteed by the accountTypes.has check above)
      provider = "Bank";
    }

  const openingBalanceMinor = openingBalanceValue?.trim()
    ? parseAmountToMinorUnits(openingBalanceValue)
    : BigInt(0);

  const defaultCurrency =
    appUser.preferences?.defaultCurrency ??
    appUser.accounts[0]?.currency ??
    "USD";

  const activeAccountCount = await prisma.account.count({
    where: {
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  await prisma.account.create({
    data: {
      userId: appUser.id,
      name,
      type: type as "CASH" | "BANK" | "MOBILE_MONEY",
      provider,
      currency: defaultCurrency,
      openingBalanceMinor,
      currentBalanceMinor: openingBalanceMinor,
      isDefault: activeAccountCount === 0,
      status: "ACTIVE",
    },
  });

  revalidatePath("/accounts");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return actionSuccess(`"${name}" was added`);
} catch (error) {
  return actionError(error, "Could not create account.");
}
}

export async function setDefaultAccount(formData: FormData): Promise<ActionResult> {
  try {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const accountId = formData.get("accountId")?.toString();

  if (!accountId) {
    throw new Error("Account ID is required.");
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  if (account.isDefault) {
    return actionSuccess(`"${account.name}" is already your default account.`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.updateMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      data: {
        isDefault: false,
      },
    });

    await tx.account.update({
      where: {
        id: account.id,
      },
      data: {
        isDefault: true,
      },
    });
  });

  revalidatePath("/accounts");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/bills");
  revalidatePath("/savings");
  revalidatePath("/debts");
  
  return actionSuccess(`"${account.name}" is now your default account.`);
} catch (error) {
  return actionError(error, "Could not set default account.");
}
}

export async function archiveAccount(formData: FormData): Promise<ActionResult> {
  try {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const accountId = formData.get("accountId")?.toString();

  if (!accountId) {
    throw new Error("Account ID is required.");
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      userId: appUser.id,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (!account) {
    throw new Error("Account not found.");
  }

  if (account.isDefault) {
    throw new Error("Set another account as default before archiving this one.");
  }

  const transactionCount = await prisma.transaction.count({
    where: {
      userId: appUser.id,
      accountId: account.id
    },
  });

  if (transactionCount > 0) {
    await prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        status: "ARCHIVED",
        deletedAt: new Date(),
      },
    });

  revalidatePath("/accounts");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return actionSuccess(`"${account.name}" was archived since it has transaction history.`);
  }

  await prisma.account.delete({
    where: { id: account.id } 
  });

  revalidatePath("/accounts");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return actionSuccess(`"${account.name}" was deleted.`);
} catch (error) {
  return actionError(error, "Could not remove account.");
}
}