"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileNavItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/manage", label: "Manage" },
  { href: "/transactions", label: "Transactions" },
  { href: "/bills", label: "Bills" },
  { href: "/settings", label: "Settings" },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 py-2 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2 py-2 text-center text-xs font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}