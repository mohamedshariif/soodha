import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  meta,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-card p-5 ${className}`}
    >
      {(title || description || meta || action) && (
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            {title && <h2 className="font-semibold text-foreground">{title}</h2>}

            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          {(meta || action) && (
            <div className="text-sm text-muted-foreground">{action ?? meta}</div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}