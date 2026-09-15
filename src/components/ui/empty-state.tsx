import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-full rounded-lg bg-muted p-4 text-center">
      <div className="text-muted-foreground w-6 h-6">{icon}</div>
      <div>
        {title && (
          <p className="text-sm font-medium text-foreground">{title}</p>
        )}

        <p
          className={
            title || icon
              ? "mt-1 text-sm text-muted-foreground"
              : "text-sm text-muted-foreground"
          }
        >
          {description}
        </p>

        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
