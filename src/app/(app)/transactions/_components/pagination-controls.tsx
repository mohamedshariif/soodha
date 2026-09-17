import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  previousHref: string;
  nextHref: string;
  getPageHref: (page: number) => string;
};

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  previousHref,
  nextHref,
  getPageHref,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(
    currentPage,
    totalPages,
  );

  return (
    <nav
      aria-label="Transaction pagination"
      className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center justify-center gap-1">
        {hasPreviousPage ? (
          <Link
            href={previousHref}
            aria-label="Go to previous page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </span>
        )}

        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageHref(page)}
              aria-current={
                page === currentPage ? "page" : undefined
              }
              className={
                page === currentPage
                  ? "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
                  : "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              }
            >
              {page}
            </Link>
          ),
        )}

        {hasNextPage ? (
          <Link
            href={nextHref}
            aria-label="Go to next page"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground opacity-50"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}