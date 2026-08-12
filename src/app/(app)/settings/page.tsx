import Link from "next/link";
import {
  CircleUserRound,
  Globe2,
  LockKeyhole,
  Palette,
  Tags,
  WalletCards,
} from "lucide-react";
import {
  updateDefaultCurrency,
  updateProfileDisplayName,
} from "./actions";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const currencyOptions = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "SOS", label: "SOS — Somali Shilling" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "ETB", label: "ETB — Ethiopian Birr" },
  { value: "DJF", label: "DJF — Djiboutian Franc" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "TRY", label: "TRY — Turkish Lira" },
];

export default async function SettingsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);

  const [defaultAccount, transactionCount, activeCategoryCount] =
    await Promise.all([
      prisma.account.findFirst({
        where: {
          userId: appUser.id,
          isDefault: true,
          status: "ACTIVE",
          deletedAt: null,
        },
      }),

      prisma.transaction.count({
        where: {
          userId: appUser.id,
          deletedAt: null,
        },
      }),

      prisma.category.count({
        where: {
          userId: appUser.id,
          status: "ACTIVE",
          deletedAt: null,
        },
      }),
    ]);

  const defaultCurrency =
    appUser.preferences?.defaultCurrency ?? defaultAccount?.currency ?? "USD";

  const canChangeCurrency =
    transactionCount === 0 &&
    (defaultAccount?.currentBalanceMinor ?? zero) === zero;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          Manage your profile, money preferences, and app setup.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CircleUserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Profile</h2>
              <p className="mt-1 text-sm text-slate-500">
                This name is used inside Soodha for greetings and display.
              </p>
            </div>
          </div>

          <form action={updateProfileDisplayName} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Display name
              </label>
              <input
                name="fullName"
                defaultValue={appUser.profile?.fullName ?? ""}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                value={appUser.email}
                disabled
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Email and sign-in are managed by your account provider.
              </p>
            </div>

            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Save profile
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <WalletCards className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Money preferences
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose the default currency for your money records.
              </p>
            </div>
          </div>

          <form action={updateDefaultCurrency} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Default currency
              </label>
              <select
                name="defaultCurrency"
                defaultValue={defaultCurrency}
                disabled={!canChangeCurrency}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>

              {!canChangeCurrency && (
                <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  Currency is locked because you already have transactions or a
                  non-zero account balance. Currency conversion and multi-currency
                  accounts will come later.
                </p>
              )}
            </div>

            <button
              disabled={!canChangeCurrency}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save currency
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <WalletCards className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Default account</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your current MVP account used for income, expenses, bills,
                savings, and debts.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">
                  {defaultAccount?.name ?? "Cash"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {defaultAccount?.type ?? "CASH"} ·{" "}
                  {defaultAccount?.currency ?? defaultCurrency}
                </p>
              </div>

              <p className="font-semibold text-slate-900">
                {formatMoneyFromMinorUnits(
                  defaultAccount?.currentBalanceMinor ?? zero,
                  defaultAccount?.currency ?? defaultCurrency
                )}
              </p>
            </div>
          </div>
          <Link
            href="/accounts"
            className="mt-4 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
              Manage accounts
          </Link>

          <p className="mt-3 text-xs text-slate-500">
            The default account is used by new income, expenses, bills, savings, and debt
            payments.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Tags className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Categories</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage income and expense categories used across Soodha.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              You currently have{" "}
              <span className="font-semibold text-slate-900">
                {activeCategoryCount}
              </span>{" "}
              active categories.
            </p>

            <Link
              href="/settings/categories"
              className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Manage categories
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Globe2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Language</h2>
              <p className="mt-1 text-sm text-slate-500">
                Soodha currently uses English. Somali and more languages can be
                added later.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">English</p>
            <p className="mt-1 text-xs text-slate-500">
              Language preference is stored in the database, but full app
              translation is not enabled yet.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <Palette className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Appearance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Theme preferences will come after the design system is fully
                tokenized.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Light mode</p>
            <p className="mt-1 text-xs text-slate-500">
              Dark mode is planned, but we should not enable it until all pages
              support it properly.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign-in, password, sessions, and account security are managed by
                Clerk. Use the profile button in the top bar to manage your
                account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}