import { Globe2, LockKeyhole, Tags } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsCard } from "./_components/settings-card";
import { ResetMonthCard } from "./_components/reset-month-card";
import { ProfileSettingsTile } from "./_components/profile-settings-tile";
import { CurrencySettingsTile } from "./_components/currency-settings-tile";
import { AppearanceSettingstile } from "./_components/appearance-settings-tile";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { DeleteAccountCard } from "./_components/delete-account-card";

export const dynamic = "force-dynamic";

const currencyOptions = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "SOS", label: "SOS — Somali Shilling" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "TRY", label: "TRY — Turkish Lira" },
];

export default async function SettingsPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser) throw new Error("You must be signed in.");

  const zero = 0n;

  const [defaultAccount, transactionCount, activeCategoryCount] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: appUser.id, isDefault: true, status: "ACTIVE", deletedAt: null },
    }),
    prisma.transaction.count({ where: { userId: appUser.id, deletedAt: null } }),
    prisma.category.count({ where: { userId: appUser.id, status: "ACTIVE", deletedAt: null } }),
  ]);

  const defaultCurrency = appUser.preferences?.defaultCurrency ?? defaultAccount?.currency ?? "USD";
  const canChangeCurrency = transactionCount === 0 && (defaultAccount?.currentBalanceMinor ?? zero) === zero;

  return (
    <>
    <PageHeader 
      title="Settings" 
      description="Manage your profile, money preferences, and app setup." 
    />
    <section className="mt-3 grid gap-2 sm:gap-4 md:grid-cols-3">
      <ProfileSettingsTile fullName={appUser.profile?.fullName ?? ""} email={appUser.email} />

        <SettingsCard
          icon={Tags}
          title="Categories"
          description={`${activeCategoryCount} active categor${activeCategoryCount === 1 ? "y" : "ies"}`}
          href="/settings/categories"
        />

        <CurrencySettingsTile
          defaultCurrency={defaultCurrency}
          canChangeCurrency={canChangeCurrency}
          currencyOptions={currencyOptions}
        />
    </section>

    <section className="mt-6 grid gap-2">
      <AppearanceSettingstile />
        <SettingsCard
          icon={Globe2}
          title="Language"
          description="English Soodha currently uses English. Somali and more languages can be added later."
        />

        <SettingsCard
          icon={LockKeyhole}
          title="Security"
          description="Sign-in, password, sessions, and account security are managed by Clerk."
        />
    </section>

    <section className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold text-danger">Danger zone</h2>
      <ResetMonthCard />
      <DeleteAccountCard email={appUser.email} />
    </section>

    </>
  );
}