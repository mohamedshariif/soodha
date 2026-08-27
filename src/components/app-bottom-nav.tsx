"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Settings,
  Receipt,
  ListSortDescending,
  BarChart3,
} from "lucide-react";

type MobileNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
}

const mobileNavItems: MobileNavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/manage", label: "Manage", icon: ListSortDescending },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-card p-2 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-primary-hover"
              }`}
            >
              <Icon className="h-5 w-5"/>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}