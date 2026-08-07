import { archiveSavingsGoal } from "./actions";
import { AddSavingsContributionModal } from "./add-savings-contribution-modal";
import { AddSavingsGoalModal } from "./add-savings-goal-modal";
import {
  formatDateForDisplay,
  getTodayDateInputValue,
} from "@/lib/date";
import { getCurrentAppUser } from "@/lib/current-app-user";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SavingsPage() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    throw new Error("You must be signed in.");
  }

  const zero = BigInt(0);
  const oneHundred = BigInt(100);
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

  const activeGoals = savingsGoals.filter((goal) => goal.status === "ACTIVE");
  const completedGoals = savingsGoals.filter(
    (goal) => goal.status === "COMPLETED"
  );

  const totalTargetMinor = savingsGoals.reduce((total, goal) => {
    return total + goal.targetAmountMinor;
  }, zero);

  const totalSavedMinor = savingsGoals.reduce((total, goal) => {
    return total + goal.currentAmountMinor;
  }, zero);

  const totalRemainingMinor = savingsGoals.reduce((total, goal) => {
    const remaining = goal.targetAmountMinor - goal.currentAmountMinor;
    return total + (remaining > zero ? remaining : zero);
  }, zero);

  const overallProgressPercent =
    totalTargetMinor > zero
      ? Number((totalSavedMinor * oneHundred) / totalTargetMinor)
      : 0;

  const overallProgressWidth = Math.min(overallProgressPercent, 100);

  const currency =
    savingsGoals[0]?.currency ?? recentContributions[0]?.currency ?? "USD";

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings</h1>
          <p className="mt-2 text-slate-600">
            Create savings goals and track contributions over time.
          </p>
        </div>

        <AddSavingsGoalModal />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SavingsSummaryCard
          label="Target total"
          value={formatMoneyFromMinorUnits(totalTargetMinor, currency)}
          helper={`${savingsGoals.length} goal${
            savingsGoals.length === 1 ? "" : "s"
          } tracked`}
        />

        <SavingsSummaryCard
          label="Saved so far"
          value={formatMoneyFromMinorUnits(totalSavedMinor, currency)}
          helper={`${overallProgressPercent}% of total target`}
          valueClassName="text-emerald-600"
        />

        <SavingsSummaryCard
          label="Remaining"
          value={formatMoneyFromMinorUnits(totalRemainingMinor, currency)}
          helper={`${activeGoals.length} active goal${
            activeGoals.length === 1 ? "" : "s"
          }`}
          valueClassName={
            totalRemainingMinor > zero ? "text-amber-600" : "text-slate-900"
          }
        />
      </div>

      {savingsGoals.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium text-slate-900">
              Overall savings progress
            </p>
            <p className="font-medium text-slate-900">
              {overallProgressPercent}%
            </p>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${overallProgressWidth}%` }}
            />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Active goals</h2>
          <p className="text-sm text-slate-500">
            {activeGoals.length} active
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {activeGoals.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No active savings goals yet.
              </p>
            </div>
          ) : (
            activeGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                today={today}
                zero={zero}
                oneHundred={oneHundred}
                canContribute
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Completed goals</h2>
          <p className="text-sm text-slate-500">
            {completedGoals.length} completed
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {completedGoals.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No completed goals yet.
              </p>
            </div>
          ) : (
            completedGoals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                today={today}
                zero={zero}
                oneHundred={oneHundred}
                canContribute={false}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">
            Recent contributions
          </h2>
          <p className="text-sm text-slate-500">
            Last {recentContributions.length}
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {recentContributions.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                No savings contributions yet.
              </p>
            </div>
          ) : (
            recentContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="font-medium text-slate-900">
                      {contribution.savingsGoal.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Added{" "}
                      {formatDateForDisplay(contribution.contributionDate)}
                    </p>

                    {contribution.note && (
                      <p className="mt-1 text-sm text-slate-500">
                        {contribution.note}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-emerald-600">
                    {formatMoneyFromMinorUnits(
                      contribution.amountMinor,
                      contribution.currency
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function SavingsGoalCard({
  goal,
  today,
  zero,
  oneHundred,
  canContribute,
}: {
  goal: {
    id: string;
    name: string;
    targetAmountMinor: bigint;
    currentAmountMinor: bigint;
    currency: string;
    deadline: Date | null;
    note: string | null;
    status: string;
    contributions: {
      id: string;
      amountMinor: bigint;
      currency: string;
      contributionDate: Date;
    }[];
  };
  today: string;
  zero: bigint;
  oneHundred: bigint;
  canContribute: boolean;
}) {
  const remainingMinor = goal.targetAmountMinor - goal.currentAmountMinor;

  const progressPercent =
    goal.targetAmountMinor > zero
      ? Number((goal.currentAmountMinor * oneHundred) / goal.targetAmountMinor)
      : 0;

  const progressWidth = Math.min(progressPercent, 100);

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{goal.name}</p>

            {goal.status === "COMPLETED" && (
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                Completed
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {formatMoneyFromMinorUnits(goal.currentAmountMinor, goal.currency)}{" "}
            saved of{" "}
            {formatMoneyFromMinorUnits(goal.targetAmountMinor, goal.currency)}
          </p>

          {goal.deadline && (
            <p className="mt-1 text-sm text-slate-500">
              Deadline {formatDateForDisplay(goal.deadline)}
            </p>
          )}

          {goal.note && (
            <p className="mt-1 text-sm text-slate-500">{goal.note}</p>
          )}
        </div>

        <div className="text-left md:text-right">
          <p
            className={`font-semibold ${
              remainingMinor > zero ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {remainingMinor > zero ? "Remaining " : "Reached "}
            {formatMoneyFromMinorUnits(
              remainingMinor > zero ? remainingMinor : zero,
              goal.currency
            )}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {progressPercent}% complete
          </p>

          <div className="mt-2 flex flex-wrap justify-start gap-3 md:justify-end">
            {canContribute && (
              <AddSavingsContributionModal
                savingsGoalId={goal.id}
                savingsGoalName={goal.name}
                today={today}
              />
            )}

            <form action={archiveSavingsGoal}>
              <input type="hidden" name="savingsGoalId" value={goal.id} />
              <button className="text-xs font-medium text-red-600 hover:text-red-700">
                Archive goal
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {goal.contributions.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500">
            Recent contributions
          </p>

          <div className="mt-2 space-y-1">
            {goal.contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex justify-between text-xs text-slate-500"
              >
                <span>
                  {formatDateForDisplay(contribution.contributionDate)}
                </span>
                <span>
                  {formatMoneyFromMinorUnits(
                    contribution.amountMinor,
                    contribution.currency
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SavingsSummaryCard({
  label,
  value,
  helper,
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}