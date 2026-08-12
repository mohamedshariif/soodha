"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  HandCoins,
  PieChart,
  Receipt,
  Calendar,
  Settings,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

type NavItems = {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItems[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Income", icon: TrendingUp },
  { href: "/expenses", label: "Expenses", icon: TrendingDown },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/bills", label: "Bills", icon: Calendar },
  { href: "/savings", label: "Savings", icon: HandCoins },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900">Soodha</h1>
        <p className="text-sm text-slate-500">Money made clear</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-100 text-green-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-green-700"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}