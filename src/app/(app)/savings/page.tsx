import { AddSavingsGoalModal } from "./add-savings-goal-modal";
import { getTodayDateInputValue } from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { prisma } from "@/lib/prisma";
import { SavingsSummaryCards } from "./_components/savings-summary-card";
import { SavingsGoalTabs } from "./_components/savings-goal-tabs";
import { RecentContributions } from "./_components/recent-contributions";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const today = getTodayDateInputValue();

  const [savingsGoals, recentContributions] = await Promise.all([
    prisma.savingsGoal.findMany({
      where: {
        userId: appUser.id,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
        deletedAt: null,
      },
      include: {
        contributions: {
          orderBy: {
            contributionDate: "desc",
          },
          take: 3,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.savingsContribution.findMany({
      where: {
        userId: appUser.id,
      },
      include: {
        savingsGoal: true,
        transaction: true,
      },
      orderBy: {
        contributionDate: "desc",
      },
      take: 5,
    }),
  ]);

  const activeGoals = savingsGoals.filter((g) => g.status === "ACTIVE");
  const completedGoals = savingsGoals.filter((g) => g.status === "COMPLETED");
  const currency =
    savingsGoals[0]?.currency ?? recentContributions[0]?.currency ?? "USD";

  return (
    <div>
      <PageHeader
        title="Savings"
        description="Create savings goals and track contribuation over time"
      >
        <AddSavingsGoalModal />
      </PageHeader>
      <SavingsSummaryCards goals={savingsGoals} currency={currency} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <SavingsGoalTabs
            activeGoals={activeGoals}
            completedGoals={completedGoals}
            today={today}
          />
        </div>

        <RecentContributions contributions={recentContributions} />
      </div>
    </div>
  );
}
