import Link from "next/link";

const manageItems = [
  {
    href: "/income",
    title: "Income",
    description: "Add and review money coming in.",
  },
  {
    href: "/expenses",
    title: "Expenses",
    description: "Add and review money going out.",
  },
  {
    href: "/budgets",
    title: "Budgets",
    description: "Set monthly spending limits.",
  },
  {
    href: "/bills",
    title: "Bills",
    description: "Track upcoming and paid bills.",
  },
  {
    href: "/savings",
    title: "Savings",
    description: "Track goals and contributions.",
  },
  {
    href: "/debts",
    title: "Debts",
    description: "Track debts and payments.",
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
        {manageItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
          >
            <h2 className="font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}