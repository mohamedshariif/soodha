import { auth } from "@clerk/nextjs/server";
import { AppHeader } from "@/components/app-header";
import { AppBottomNav } from "@/components/app-bottom-nav";
import { AppSidebar } from "@/components/app-sidebar";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { ToastProvider } from "@/components/ui/toast-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();

  const appUser = await getCurrentAppUser();

  const fullName = appUser?.profile?.fullName ?? "there";

  return (
    <ToastProvider>
    <div className="h-screen overflow-hidden bg-background">
      <div className="flex h-full">
        <AppSidebar />

        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <AppHeader fullName={fullName}/>

          <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
            {children}
          </main>
        </div>

        <AppBottomNav />
      </div>
    </div>
    </ToastProvider>
  );
}