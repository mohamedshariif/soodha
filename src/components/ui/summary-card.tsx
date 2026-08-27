import type { ReactNode } from "react";

export function SummaryCard({
  label,
  value,
  helper,
  icon,
  valueClassName = "text-slate-900",
  labelClassName = "text-muted-foreground",
  helperClassName = "text-muted-foreground",
  iconClassName = "bg-muted text-primary",
  className = "",
}: {
  label: string;
  value: string;
  helper?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
  labelClassName?: string;
  helperClassName?: string;
  iconClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`group rounded-xl border border-border p-5 transition-all hover:-translate-y-1 duration-300 ease-out hover:shadow-md ${className || "bg-card"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-md ${labelClassName}`}>
            {label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${valueClassName}`}>
            {value}
          </p>

          {helper && (
            <div className={`mt-1 text-sm ${helperClassName}`}>
              {helper}
            </div>
          )}
        </div>

        {icon && (
          <div className={`rounded-lg p-2 ${iconClassName}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}