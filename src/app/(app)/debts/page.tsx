import { getTodayDateInputValue } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { SummaryCard } from "@/components/ui/summary-card";
import { DebtsBoard } from "./_components/debts-board";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AddDebtModal } from "./add-debt-modal";

export const dynamic = "force-dynamic";

export default async function DebtsPage() {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const today = getTodayDateInputValue();
  const zero = 0n;

  const debts = await prisma.debt.findMany({
    where: {
      userId: appUser.id,
      status: { in: ["ACTIVE", "PAID_OFF"] },
      deletedAt: null,
    },
    include: {
      payments: { orderBy: { paidAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "desc" },
  });

  const currency = debts[0]?.currency ?? "USD";

  const iOweDebts = debts.filter((debt) => debt.direction === "I_OWE");
  const owedToMeDebts = debts.filter((debt) => debt.direction === "OWED_TO_ME");

  const iOweTotal = iOweDebts.reduce((sum, debt) => sum + debt.originalAmountMinor, zero);
  const iOweRemaining = iOweDebts
    .filter((debt) => debt.status === "ACTIVE")
    .reduce((sum, debt) => sum + debt.remainingAmountMinor, zero);

  const owedToMeTotal = owedToMeDebts.reduce((sum, debt) => sum + debt.originalAmountMinor, zero);
  const owedToMeRemaining = owedToMeDebts
    .filter((debt) => debt.status === "ACTIVE")
    .reduce((sum, debt) => sum + debt.remainingAmountMinor, zero);

  return (
    <div>
      <PageHeader
        title="Debts"
         description="Create savings goals and track contribuation over time"
      >
        <AddDebtModal />
      </PageHeader>

      <div className="mt-2 grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 ">
        <SummaryCard 
          label="I Owe (Payable)"
          value={formatMoneyFromMinorUnits(iOweTotal, currency)}
          helper={`${formatMoneyFromMinorUnits(iOweRemaining, currency)} Remaining`}
          icon={<ArrowUpRight className="w-5 h-5"/>}
          valueClassName={iOweRemaining > zero ? "text-green-700" : "text-primary"}
          iconClassName={`${iOweRemaining > zero ? "bg-green-700/10 text-green-700 dark:text-green-700" : "bg-primary/10 text-primary"}`}
        />
        <SummaryCard 
          label="Owed to me (Receivable)"
          value={formatMoneyFromMinorUnits(owedToMeTotal, currency)}
          helper={`${formatMoneyFromMinorUnits(owedToMeRemaining , currency)} Remaining`}
          icon={<ArrowDownLeft className="w-5 h-5"/>}
          valueClassName={owedToMeRemaining > zero ? "text-success" : "text-muted-foreground"}
          iconClassName={`${owedToMeRemaining > zero ? "bg-primary/10 dark:bg-primary/20  text-primary" : "bg-primary/20 text-primary"}`}
        />
      </div>

      <DebtsBoard debts={debts} today={today} />
    </div>
  );
}
