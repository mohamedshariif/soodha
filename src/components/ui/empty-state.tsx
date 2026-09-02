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
    <div className="w-full rounded-lg bg-muted p-4 text-center">
      {title && <p className="text-sm font-medium text-foreground">{title}</p>}

      <p className={title ? "mt-1 text-sm text-muted-foreground" : "text-sm text-muted-foreground"}>
        {description}
      </p>

      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}