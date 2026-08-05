import { archiveBill } from "./actions";
import { AddBillModal } from "./add-bill-modal";
import {
  formatDateForDisplay,
  getTodayDateInputValue,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const [expenseCategories, bills] = await Promise.all([
    prisma.category.findMany({
      where: {
        userId: appUser.id,
        type: "EXPENSE",
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),

    prisma.bill.findMany({
      where: {
        userId: appUser.id,
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        category: true,
      },
      orderBy: {
        nextDueDate: "asc",
      },
    }),
  ]);

  const today = getTodayDateInputValue();

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="mt-2 text-slate-600">
            Track upcoming bills before they become real expenses.
          </p>
        </div>

        <AddBillModal expenseCategories={expenseCategories} today={today} />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Upcoming bills</h2>
          <p className="text-sm text-slate-500">
            {bills.length} bill{bills.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {bills.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No bills added yet. Add your first bill to track upcoming
                payments.
              </p>
            </div>
          ) : (
            bills.map((bill) => {
              const dueDate = formatDateForDisplay(bill.nextDueDate);
              const categoryName = bill.category?.name ?? "No category";

              return (
                <div
                  key={bill.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <p className="font-medium text-slate-900">
                        {bill.name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {categoryName} · Due {dueDate} ·{" "}
                        {formatRepeatLabel(bill.repeatType)}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-semibold text-slate-900">
                        {formatMoneyFromMinorUnits(
                          bill.amountMinor,
                          bill.currency
                        )}
                      </p>

                      <form action={archiveBill} className="mt-2">
                        <input type="hidden" name="billId" value={bill.id} />
                        <button className="text-xs font-medium text-red-600 hover:text-red-700">
                          Delete bill
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function formatRepeatLabel(repeatType: string) {
  switch (repeatType) {
    case "WEEKLY":
      return "Repeats weekly";
    case "MONTHLY":
      return "Repeats monthly";
    case "YEARLY":
      return "Repeats yearly";
    default:
      return "One-time";
  }
}