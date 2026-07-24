import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentAppUser } from "@/lib/current-app-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  const appUser = await getCurrentAppUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AppSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-lg font-semibold text-slate-900">
                {appUser?.profile?.fullName}
              </h1>
            </div>

            <UserButton />
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}