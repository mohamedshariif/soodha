import { auth } from "@clerk/nextjs/server";
import { getCurrentAppUser } from "@/lib/current-app-user";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await auth.protect();

  const appUser = await getCurrentAppUser();

  return (
    <main className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>

      <h2 className="text-xl font-semibold text-slate-300">
        Welcome, {appUser?.profile?.fullName}
      </h2>

      <p className="mt-2 text-slate-400">Your Email: {appUser?.email}</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-900">Account created</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your internal Soodha user record is connected to Clerk.
        </p>
      </div>
    </main>
  );
}