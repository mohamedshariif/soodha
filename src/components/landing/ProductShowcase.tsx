"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Calendar,
  Check,
  CreditCard,
  HandCoins,
  LayoutDashboard,
  PieChart,
  Receipt,
  WalletCards,
} from "lucide-react";
import { FeatureMarquee } from "./feature-marquee";
import type { ProductTab, ProductTabKey } from "./product-showcase-data";

const TABS: readonly ProductTab[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "Your finances, all in one clear view",
    desc: "Get a simple overview of your financial activity, including your balance, income, expenses, and recent transactions.",
    points: [
      "See your total balance at a glance",
      "Track income and expenses over time",
      "Review your latest financial activity",
    ],
    imageLight: "/landing/dash-preview-light.png",
    imageDark: "/landing/dash-preview-dark.png",
  },
  {
    key: "transactions",
    label: "Transactions",
    icon: Receipt,
    title: "Keep every transaction organized",
    desc: "Record and manage your income, expenses, and transfers in one place, with powerful search and filtering when you need it.",
    points: [
      "Track income, expenses, and transfers",
      "Organize transactions by category",
      "Search and filter your transaction history",
    ],
    imageLight: "/landing/transactions-preview-light.png",
    imageDark: "/landing/transactions-preview-dark.png",
  },
  {
    key: "accounts",
    label: "Accounts",
    icon: CreditCard,
    title: "Manage all your accounts in one place",
    desc: "Keep track of your different accounts and see how your money is distributed without switching between different places.",
    points: [
      "Manage multiple financial accounts",
      "Track individual account balances",
      "Keep your money organized in one place",
    ],
    imageLight: "/landing/accounts-preview-light.png",
    imageDark: "/landing/accounts-preview-dark.png",
  },
  {
    key: "bills",
    label: "Bills",
    icon: Calendar,
    title: "Stay on top of your upcoming bills",
    desc: "Keep your bills organized with due dates, amounts, and payment status so you always know what needs to be paid.",
    points: [
      "Keep track of upcoming bills",
      "See paid and unpaid bills",
      "Monitor bill amounts and due dates",
    ],
    imageLight: "/landing/bills-preview-light.png",
    imageDark: "/landing/bills-preview-dark.png",
  },
  {
    key: "budgets",
    label: "Budgets",
    icon: PieChart,
    title: "Plan your spending with confidence",
    desc: "Set spending limits for your categories and keep an eye on how much you've used throughout the month.",
    points: [
      "Create budgets for spending categories",
      "Track spending against your limits",
      "See your budget progress at a glance",
    ],
    imageLight: "/landing/budgets-preview-light.png",
    imageDark: "/landing/budgets-preview-dark.png",
  },
  {
    key: "savings",
    label: "Savings",
    icon: HandCoins,
    title: "Keep your debts organized",
    desc: "Track what you owe and keep important debt information together so you always have a clearer picture of your financial obligations.",
    points: [
      "Track individual debts and balances",
      "Keep debt information organized",
      "Monitor your outstanding obligations",
    ],
    imageLight: "/landing/savings-preview-light.png",
    imageDark: "/landing/savings-preview-dark.png",
  },
  {
    key: "debts",
    label: "Debts",
    icon: WalletCards,
    title: "Keep your debts organized",
    desc: "Track what you owe and keep important debt information together so you always have a clearer picture of your financial obligations.",
    points: [
      "Track individual debts and balances",
      "Keep debt information organized",
      "Monitor your outstanding obligations",
    ],
    imageLight: "/landing/debts-preview-light.png",
    imageDark: "/landing/debts-preview-dark.png",
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
    title: "Understand your financial patterns",
    desc: "Turn your transaction history into clear reports that help you see where your money is going and how your finances change over time.",
    points: [
      "Analyze income and expense activity",
      "Understand your spending patterns",
      "Review your financial data over time",
    ],
    imageLight: "/landing/reports-preview-light.png",
    imageDark: "/landing/reports-preview-dark.png",
  },
];

export function ProductShowcase() {
  const [activeKey, setActiveKey] = useState<ProductTabKey>(TABS[0].key);
  const active = TABS.find((tab) => tab.key === activeKey)!;

  const { resolvedTheme } = useTheme();

  const activeImage =
    resolvedTheme === "dark" ? active.imageDark : active.imageLight;

  return (
    <section
      id="showcase"
      className="border-b border-border-subtle bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center justify-center gap-3">
          <div className="rounded-full bg-primary/10 px-4 py-2">
            <span className="font-semibold text-primary">Platform</span>
          </div>
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            See your entire financial life,
            <span className="text-primary"> in one place.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-center text-muted-foreground">
            Explore Soodha&apos;s tools for tracking, organizing, and
            understanding your finances — all in one simple place.
          </p>
        </div>

        <FeatureMarquee
          tabs={TABS} 
          activeKey={activeKey} 
          onSelect={setActiveKey} 
        />

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
              {active.title}
            </h3>
            <p className="mt-3 max-w-md text-muted-foreground">{active.desc}</p>

            <ul className="mt-6 flex flex-col gap-3">
              {active.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-foreground"
                >
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success/15 text-success">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 aspect-16/8 overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:order-2">
              <Image
                key={activeImage}
                src={activeImage}
                alt={active.title}
                fill
                className="object-contain object-center p-2"
              />
          </div>
        </div>
      </div>
    </section>
  );
}
