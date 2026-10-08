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
    <div className="flex h-dvh min-h-0 overflow-hidden overscroll-none bg-background">
        <AppSidebar />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppHeader fullName={fullName}/>

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-34 lg:p-6 lg:pb-20">
            {children}
          </main>
        </div>

        <AppBottomNav />
    </div>
    </ToastProvider>
  );
}