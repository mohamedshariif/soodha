"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { parseAmountToMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const accountTypes = new Set(["CASH", "BANK", "MOBILE_MONEY", "CARD", "OTHER"]);

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createAccount(formData: FormData) {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const rawName = formData.get("name")?.toString();
  const type = formData.get("type")?.toString();
  const provider = formData.get("provider")?.toString().trim();
  const openingBalanceValue = formData.get("openingBalance")?.toString();

  if (!rawName?.trim()) {
    throw new Error("Account name is required.");
  }

  if (!type || !accountTypes.has(type)) {
    throw new Error("Account type is invalid.");
  }

  const name = normalizeText(rawName);

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
      type: type as "CASH" | "BANK" | "MOBILE_MONEY" | "CARD" | "OTHER",
      provider: provider || null,
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
}

export async function setDefaultAccount(formData: FormData) {
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
  revalidatePath("/income");
  revalidatePath("/expenses");
  revalidatePath("/bills");
  revalidatePath("/savings");
  revalidatePath("/debts");
}

export async function archiveAccount(formData: FormData) {
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
}