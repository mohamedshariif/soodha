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
      className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}
    >
      {(title || description || meta || action) && (
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            {title && <h2 className="font-semibold text-slate-900">{title}</h2>}

            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>

          {(meta || action) && (
            <div className="text-sm text-slate-500">{action ?? meta}</div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}