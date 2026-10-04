"use client";

import Link from "next/link";
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

  if (pathname === "/bills") {
    return "Track upcoming bills before they become real expenses";
  }

  if (pathname === "/savings") {
    return "Track your saving goals";
  }

  if (pathname === "/debts") {
    return "Track your debts today";
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
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              S
            </div>
              <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-foreground">
              Soodha
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          </Link>
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
