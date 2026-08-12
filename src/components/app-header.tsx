"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { MonthSelector } from "@/components/month-selector";
import { TimeGreeting } from "@/components/time-greeting";

function getHeaderDescription(pathname: string) {
  if (pathname === "/dashboard") {
    return "Here is your money overview";
  }

  if (pathname === "/reports") {
    return "Review your monthly financial report";
  }

  return "Welcome back to Soodha";
}

export function AppHeader({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* const supportsMonthSelector =
  pathname.startsWith("/dashboard") || pathname.startsWith("/reports"); */

  const supportsMonthSelector =
    pathname === "/dashboard" || pathname === "/reports";
  
  const selectedMonth = searchParams.get("month") ?? "";

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="lg:hidden">
        <h1 className="text-xl font-bold text-slate-900">Soodha</h1>
        <p className="text-xs text-slate-500">Money made clear</p>
      </div>

      <div className="hidden lg:block">
        <p className="text-sm font-semibold text-slate-900">
          <TimeGreeting name={fullName} />
        </p>

        <p className="text-xs text-slate-500">
          {getHeaderDescription(pathname)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {supportsMonthSelector && (
          <div className="hidden lg:block">
            <MonthSelector value={selectedMonth}/>
          </div>
        )}

        <UserButton />
      </div>
    </header>
  );
}