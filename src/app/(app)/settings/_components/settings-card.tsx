import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

export function SettingsCard({
  icon: Icon,
  title,
  description,
  href,
  onClick,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const isInteractive = Boolean(href || onClick);

  const header = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 rounded-lg p-2 ${
            isInteractive ? "bg-muted text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {isInteractive && <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}
    </div>
  );

  return (
    <section className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      {href ? (
        <Link href={href} className="block">
          {header}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className="block w-full text-left">
          {header}
        </button>
      ) : (
        header
      )}
    </section>
  );
}