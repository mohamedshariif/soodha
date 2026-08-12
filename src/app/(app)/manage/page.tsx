import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { 
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  HandCoins,
  CreditCard,
} from "lucide-react";

type ManageItems = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const manageItems: ManageItems[] = [
  {
    href: "/income",
    title: "Income",
    description: "Add and review money coming in.",
    icon: TrendingUp,
  },
  {
    href: "/expenses",
    title: "Expenses",
    description: "Add and review money going out.",
    icon: TrendingDown,
  },
  {
    href: "/budgets",
    title: "Budgets",
    description: "Set monthly spending limits.",
    icon: PieChart,
  },
  {
    href: "/bills",
    title: "Bills",
    description: "Track upcoming and paid bills.",
    icon: Calendar,
  },
  {
    href: "/savings",
    title: "Savings",
    description: "Track goals and contributions.",
    icon: HandCoins,
  },
  {
    href: "/debts",
    title: "Debts",
    description: "Track debts and payments.",
    icon: CreditCard,
  },
  {
    href: "/reports",
    title: "Reports",
    description: "Review monthly income, expenses, and money movement.",
  },
];

export default function ManagePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Manage</h1>
      <p className="mt-2 text-slate-600">
        Add and manage the main parts of your money flow.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {manageItems.map((item) => {
          const Icon = item.icon;

          return (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-green-700">
                <Icon className="h-5 w-5"/>
              </div>
              <div>
                <h2 className="font-medium text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}