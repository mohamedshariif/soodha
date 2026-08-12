import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      {title && <p className="text-sm font-medium text-slate-900">{title}</p>}

      <p className={title ? "mt-1 text-sm text-slate-600" : "text-sm text-slate-600"}>
        {description}
      </p>

      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}