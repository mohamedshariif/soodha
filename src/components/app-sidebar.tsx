"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  WalletCards,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: WalletCards },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/bills", label: "Bills", icon: Receipt },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/accounts", label: "Accounts", icon: WalletCards },
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}