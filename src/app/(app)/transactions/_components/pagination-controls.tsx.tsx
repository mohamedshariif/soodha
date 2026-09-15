import Link from "next/link";

export function PaginationControls({
  hasPreviousPage,
  hasNextPage,
  previousHref,
  nextHref,
}: {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousHref: string;
  nextHref: string;
}) {
  if (!hasPreviousPage && !hasNextPage) return null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
      {hasPreviousPage ? (
        <Link href={previousHref} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          Previous
        </Link>
      ) : (
        <span />
      )}

      {hasNextPage ? (
        <Link href={nextHref} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          Next
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}