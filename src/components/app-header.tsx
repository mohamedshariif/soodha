"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname, useSearchParams } from "next/navigation";
import { MonthSelector } from "@/components/month-selector";
import { TimeGreeting } from "@/components/time-greeting";
import { ThemeToggle } from "./theme-toggle";

function getHeaderDescription(pathname: string) {
  if (pathname === "/dashboard") {
    return "Here is your money overview";
  }

  if (pathname === "/reports") {
    return "Review your monthly financial report";
  }

  if (pathname === "/budgets") {
    return "Plan and track your monthly spending";
  }

  if (pathname === "/savings") {
    return "Track your saving goals";
  }

  return "Welcome back to Soodha";
}

const MONTH_SELECTOR_PATHS = new Set(["/dashboard", "/reports", "/budgets"]);

export function AppHeader({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const supportsMonthSelector = MONTH_SELECTOR_PATHS.has(pathname);

  const selectedMonth = searchParams.get("month") ?? "";

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="lg:hidden">
        <h1 className="text-xl font-bold text-foreground">Soodha</h1>
        <TimeGreeting
          name={fullName}
          className="text-xs text-muted-foreground font-semibold"
        />
      </div>

      <div className="hidden lg:block">
        <TimeGreeting name={fullName} />

        <p className="text-xs text-muted-foreground">
          {getHeaderDescription(pathname)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {supportsMonthSelector && <MonthSelector value={selectedMonth} />}

        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
}
