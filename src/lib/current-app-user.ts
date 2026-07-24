import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureDefaultCategories } from "@/lib/default-categories";

export async function getCurrentAppUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error("Signed-in user does not have a primary email address.");
  }

  const fullName =
    clerkUser.fullName ||
    clerkUser.username ||
    email.split("@")[0] ||
    "Soodha User";

  const appUser = await prisma.appUser.upsert({
    where: {
      authProviderUserId: userId,
    },
    update: {
      email,
    },
    create: {
      authProviderUserId: userId,
      email,
      profile: {
        create: {
          fullName,
          avatarUrl: clerkUser.imageUrl,
        },
      },
      preferences: {
        create: {
          defaultCurrency: "USD",
          language: "en",
          theme: "SYSTEM",
        },
      },
      accounts: {
        create: {
          name: "Cash",
          type: "CASH",
          currency: "USD",
          isDefault: true,
        },
      },
    },
    include: {
      profile: true,
      preferences: true,
      accounts: true,
    },
  });

  await ensureDefaultCategories(appUser.id);

  return appUser;
}

// If user exists → return user
// If user does not exist → create app user, profile, preferences, and default Cash account