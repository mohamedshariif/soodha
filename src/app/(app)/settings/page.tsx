import Link from "next/link";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-2 text-slate-600">
        Manage your Soodha preferences and app setup.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link
          href="/settings/categories"
          className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">Categories</h2>
          <p className="mt-1 text-sm text-slate-600">
            Manage income and expense categories.
          </p>
        </Link>
      </div>
    </div>
  );
}