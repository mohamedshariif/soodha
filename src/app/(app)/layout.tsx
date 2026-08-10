import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { AppBottomNav } from "@/components/app-bottom-nav";
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
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full">
        <AppSidebar />

        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
            <div>
              <p className="text-sm text-slate-500">Welcome back</p>
              <h1 className="text-lg font-semibold text-slate-900">
                {appUser?.profile?.fullName}
              </h1>
            </div>

            <UserButton />
          </header>

          <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
            {children}
          </main>
        </div>

        <AppBottomNav />
      </div>
    </div>
  );
}