import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { 
  PieChart,
  Calendar,
  HandCoins,
  CreditCard,
  Wallet,
  ReceiptText,
} from "lucide-react";

type ManageItems = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const manageItems: ManageItems[] = [
  {
    href: "/accounts",
    title: "Accounts",
    description: "Manage cash, bank, card, and mobile money balances.",
    icon: Wallet,
  },
  {
    href: "/bills",
    title: "Bills",
    description: "Track upcoming and paid bills.",
    icon: Calendar,
  },
  {
    href: "/budgets",
    title: "Budgets",
    description: "Set monthly spending limits.",
    icon: PieChart,
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
];

export default function ManagePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Manage</h1>
      <p className="mt-2 text-muted-foreground">
        Add and manage the main parts of your money flow.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {manageItems.map((item) => {
          const Icon = item.icon;

          return (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-border-subtle bg-card p-5 transition hover:border-border-strong hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2 text-primary">
                <Icon className="h-5 w-5"/>
              </div>
              <div>
                <h2 className="font-medium text-foreground">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
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