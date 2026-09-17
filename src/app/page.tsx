import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 sm:px-12">
        <span className="text-xl font-semibold">Soodha</span>
        <nav className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Track your money, simply.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Soodha helps you manage income, expenses, budgets, bills, savings,
          and debts — all in one clean dashboard.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/sign-up"
            className="rounded-lg bg-foreground px-6 py-3 font-medium text-background hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-border px-6 py-3 font-medium hover:bg-muted"
          >
            Sign In
          </Link>
        </div>
      </main>

      <section className="grid grid-cols-1 gap-6 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4 sm:px-12">
        {[
          { label: "Budgets", desc: "Set limits and track spending by category." },
          { label: "Bills", desc: "Never miss a due date again." },
          { label: "Savings Goals", desc: "Watch your progress grow over time." },
          { label: "Debt Tracking", desc: "See exactly what you owe, and pay it down." },
        ].map((f) => (
          <div key={f.label} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">{f.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}