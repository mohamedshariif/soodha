import { WalletCards, ArrowDownUp, Layers3, Target, CalendarCheck, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: WalletCards,
    title: "One Clear Financial Picture",
    desc: "See your balances, income, expenses, and financial activity in one simple place.",
  },
  {
    icon: ArrowDownUp,
    title: "Organized Transactions",
    desc: "Keep your income, expenses, and transfers organized, searchable, and easy to manage.",
  },
  {
    icon: Layers3,
    title: "Manage Multiple Accounts",
    desc: "Keep track of your different accounts and see where your money is at a glance.",
  },
  {
    icon: Target,
    title: "Stay on Budget",
    desc: "Set spending limits for your categories and keep track of your progress throughout the month.",
  },
  {
    icon: CalendarCheck,
    title: "Bills & Debt Tracking",
    desc: "Keep upcoming bills and outstanding debts organized so important financial obligations stay visible.",
  },
  {
    icon: BarChart3,
    title: "Understand Your Spending",
    desc: "Use reports and financial insights to see your spending patterns and understand where your money goes.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="border-b border-border-subtle bg-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything you need to stay in control of your money
          </h2>

          <p className="mt-4 text-muted-foreground">
            Simple tools to help you track, organize, and understand your
            finances in one place.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-border-strong"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <h3 className="font-semibold text-card-foreground">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
