// app/savings/_components/recent-contributions.tsx
import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { guessSavingsGoalIcon } from "@/lib/icons/savings-goal-icon-suggests";

export function RecentContributions({
  contributions,
}: {
  contributions: {
    id: string;
    amountMinor: bigint;
    currency: string;
    contributionDate: Date;
    note: string | null;
    savingsGoal: { name: string };
  }[];
}) {
  return (
    <section className="mt-20 rounded-xl border border-border bg-card py-5 w-full lg:self-start">
      <div className="flex items-center justify-between px-4">
        <h2 className="font-semibold text-foreground">Recent contributions</h2>
        <p className="text-sm text-muted-foreground">
          Last {contributions.length}
        </p>
      </div>

      <div className="mt-6 space-y-1 border-t border-border">
        {contributions.length === 0 ? (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              No savings contributions yet.
            </p>
          </div>
        ) : (
          contributions.map((c) => {
            const ContributionIcon = guessSavingsGoalIcon(c.savingsGoal.name);

            return (
              <div
                key={c.id}
                className="border-b border-border-subtle px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted rounded-full p-3 shrink-0">
                      <ContributionIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {c.savingsGoal.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {" "}
                        {formatDateForDisplay(c.contributionDate)}
                      </p>
                      {c.note && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {c.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-primary self-start">
                    {formatMoneyFromMinorUnits(c.amountMinor, c.currency)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
