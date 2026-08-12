import type { ReactNode } from "react";

export function SummaryCard({
  label,
  value,
  helper,
  icon,
  valueClassName = "text-slate-900",
  className = "",
}: {
  label: string;
  value: string;
  helper?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>
            {value}
          </p>

          {helper && <div className="mt-1 text-xs text-slate-500">{helper}</div>}
        </div>

        {icon && (
          <div className="rounded-lg bg-slate-50 p-2 text-slate-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}