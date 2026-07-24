import { getCurrentAppUser } from "@/lib/current-app-user";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const appUser = await getCurrentAppUser();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <p className="mt-2 text-slate-600">
        Welcome to Soodha, {appUser?.profile?.fullName}.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total income</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">$0.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total expenses</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">$0.00</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Balance</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">$0.00</p>
        </div>
      </div>
    </div>
  );
}