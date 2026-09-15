import { ReactNode } from "react";
import { BillCard } from "./bill-card";

export function BillList({
  bills,
  today,
  emptyIcon,
  emptyText,
}: {
  bills: Parameters<typeof BillCard>[0]["bill"][];
  today: Date;
  emptyIcon: ReactNode;
  emptyText: string;
}) {
  return (
    <section>

      {bills.length === 0 ? (
        <div className=" flex flex-col items-center gap-2 mt-4 rounded-lg bg-muted p-4">
          <span>{emptyIcon}</span>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} today={today} />
          ))}
        </div>
      )}
    </section>
  );
}