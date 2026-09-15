import { formatDateForDisplay } from "@/lib/date";
import { formatMoneyFromMinorUnits } from "@/lib/money";
import { EditTransactionModal } from "./edit-trans-modal";
import { DeleteTransactionButton } from "./delete-trans-btn";
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react";

type CategoryOption = { id: string; name: string };

export function TransactionRow({
  transaction,
  categories,
}: {
  transaction: {
    id: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amountMinor: bigint;
    currency: string;
    transactionDate: Date;
    description: string | null;
    note: string | null;
    sourceType: string;
    categoryId: string | null;
    category: { name: string } | null;
    account: { name: string };
  };
  categories: CategoryOption[];
}) {
  const isIncome = transaction.type === "INCOME";
  const isExpense = transaction.type === "EXPENSE";
  const isTransfer = transaction.type === "TRANSFER";
  const isManual = transaction.sourceType === "MANUAL";

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-3">
      <div>

          <p className="text-sm font-medium text-foreground">
            {transaction.description ?? transaction.category?.name}
          </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {transaction.category?.name ?? "No category"} · {transaction.account.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDateForDisplay(transaction.transactionDate)}
        </p>

        {transaction.note && <p className="mt-1 text-xs text-muted-foreground">{transaction.note}</p>}
      </div>

      <div className="">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs font-semibold bg-muted rounded-full py-1 px-2
              ${isIncome ? "text-primary" : isExpense ? "text-red-600" : "text-blue-600"}`}>
            {isIncome ? <ArrowUpRight className="w-4 h-4"/> 
              : isExpense ? <ArrowDownRight className="w-4 h-4"/> 
              : <ArrowRightLeft className="w-4 h-4"/>}
            <p >
              {isTransfer ? "TRANSFER" : transaction.type}
            </p>
        </div>
        <p
          className={`text-sm font-semibold ${
            isIncome ? "text-emerald-600" : isExpense ? "text-red-600" : "text-blue-600"
          }`}
        >
          {isIncome ? "+" : isExpense ? "-" : ""}
          {formatMoneyFromMinorUnits(transaction.amountMinor, transaction.currency)}
        </p>
        </div>

        {isManual ? (
          <div className="mt-2 flex justify-end gap-2">
            <EditTransactionModal transaction={transaction} categories={categories} />
            <DeleteTransactionButton transactionId={transaction.id} />
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}