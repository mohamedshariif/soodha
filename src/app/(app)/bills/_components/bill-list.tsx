import { BillCard } from "./bill-card";

export function BillList({
  title,
  helper,
  bills,
  today,
  emptyText,
}: {
  title: string;
  helper: string;
  bills: Parameters<typeof BillCard>[0]["bill"][];
  today: Date;
  emptyText: string;
}) {
  return (
    <section className="">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>

      {bills.length === 0 ? (
        <div className="mt-4 rounded-lg bg-muted p-4">
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