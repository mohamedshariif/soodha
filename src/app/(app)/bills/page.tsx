import { Receipt, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { AddBillModal } from "./add-bill-modal";
import {
  getTodayDateInputValue,
  getCurrentMonthInputValue,
  parseDateInputToTransactionDate,
  parseMonthInputToBudgetPeriod,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { groupBillsByStatus, sumAmountsMinor } from "@/lib/bills";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryCard } from "@/components/ui/summary-card";
import { BillTabs } from "./_components/bill-tabs";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const todayInputValue = getTodayDateInputValue();
  const todayDate = parseDateInputToTransactionDate(todayInputValue);

  const currentMonthValue = getCurrentMonthInputValue();
  const { periodStart, periodEnd } =
    parseMonthInputToBudgetPeriod(currentMonthValue);

  const [expenseCategories, bills, paidThisMonth, paidForBillsDueThisMonth] =
    await Promise.all([
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
        where: { userId: appUser.id, status: "ACTIVE", deletedAt: null },
        include: { category: true },
        orderBy: { nextDueDate: "asc" },
      }),
      prisma.billPayment.findMany({
        where: {
          userId: appUser.id,
          transaction: {
            transactionDate: { gte: periodStart, lte: periodEnd },
          },
        },
        include: { bill: { include: { category: true } }, transaction: true },
        orderBy: { paidAt: "desc" },
      }),

      prisma.billPayment.findMany({
        where: {
          userId: appUser.id,
          dueDate: { gte: periodStart, lte: periodEnd },
        },
        select: { amountMinor: true },
      }),
    ]);

  console.log("periodStart:", periodStart.toISOString());
  console.log("periodEnd:", periodEnd.toISOString());
  console.log(
    "bills:",
    bills.map((b) => ({
      name: b.name,
      nextDueDate: b.nextDueDate.toISOString(),
    })),
  );

  const expenseCategoryOptions = expenseCategories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const { overdue, upcoming } = groupBillsByStatus(bills, todayDate);

  const remainingBillsThisMonth = bills.filter(
    (bill) =>
      bill.nextDueDate.getTime() >= periodStart.getTime() &&
      bill.nextDueDate.getTime() <= periodEnd.getTime(),
  );

  const overdueTotalMinor = sumAmountsMinor(overdue);
  const paidThisMonthMinor = sumAmountsMinor(paidThisMonth);
  const remainingThisMonthMinor = sumAmountsMinor(remainingBillsThisMonth);
  const paidDueThisMonthMinor = sumAmountsMinor(paidForBillsDueThisMonth);

  const totalBillsThisMonthMinor =
    remainingThisMonthMinor + paidDueThisMonthMinor;

  const currency = bills[0]?.currency ?? paidThisMonth[0]?.currency ?? "USD";

  return (
    <div>
      <PageHeader
        title="Bills"
        description="Track upcoming bills before they become real expenses."
      >
        <AddBillModal
          expenseCategories={expenseCategoryOptions}
          today={todayInputValue}
        />
      </PageHeader>

      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          label="Total bills this month"
          value={formatMoneyFromMinorUnits(totalBillsThisMonthMinor, currency)}
          helper={`${remainingBillsThisMonth.length + paidForBillsDueThisMonth.length} bills due this month`}
          icon={<Receipt className="h-5 w-5" />}
          valueClassName="text-foreground"
        />

        <div className="grid grid-cols-2 gap-2 md:contents">
          <SummaryCard
            label="Paid"
            value={formatMoneyFromMinorUnits(paidThisMonthMinor, currency)}
            helper={`Remaining: ${formatMoneyFromMinorUnits(remainingThisMonthMinor, currency)}`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            valueClassName="text-emerald-600"
          />

          <SummaryCard
            label="Overdue"
            value={formatMoneyFromMinorUnits(overdueTotalMinor, currency)}
            helper={`${overdue.length} bill${overdue.length === 1 ? "" : "s"} past due`}
            icon={<AlertTriangle className="h-5 w-5" />}
            valueClassName={
              overdue.length > 0 ? "text-red-600" : "text-foreground"
            }
            iconClassName="bg-muted text-red-600"
          />
        </div>
      </div>

      <div className="mt-6">
        <BillTabs
          upcomingBills={upcoming}
          overdueBills={overdue}
          paidPayments={paidThisMonth}
          today={todayDate}
        />
      </div>
    </div>
  );
}
