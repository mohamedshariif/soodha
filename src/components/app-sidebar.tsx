"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  HandCoins,
  Receipt,
  Settings,
  WalletCards,
  Calendar,
  PieChart,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/accounts", label: "Accounts", icon: WalletCards },
  { href: "/bills", label: "Bills", icon: Calendar },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/savings", label: "Savings", icon: HandCoins },
  { href: "/debts", label: "Debts", icon: CreditCard },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-foreground">Soodha</h1>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto">
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
                  ? "bg-muted text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-primary-hover"
              }`}
            >
              <Icon 
                className="h-5 w-5 shrink-0" 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}