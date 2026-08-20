import { applySortParam } from "~/lib/sort-params";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  slugString: string;
  currentSort: string;
  /** Orden inicial de la cuenta, para omitir el parámetro cuando coincide. */
  defaultSort?: string;
  extraParams?: Record<string, string>;
}

function buildPageUrl(
  slugString: string,
  currentSort: string,
  defaultSort: string,
  page: number,
  extraParams?: Record<string, string>,
): string {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) params.set(k, v);
    }
  }
  applySortParam(params, currentSort, defaultSort);
  if (page > 1) params.set("page", page.toString());
  const qs = params.toString();
  return `/${slugString}${qs ? `?${qs}` : ""}`;
}

function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) pages.push("ellipsis");

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  slugString,
  currentSort,
  defaultSort = "default",
  extraParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginación"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Button variant="outline" size="sm" asChild>
          <Link
            href={buildPageUrl(
              slugString,
              currentSort,
              defaultSort,
              currentPage - 1,
              extraParams,
            )}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
      )}

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className="min-w-[36px]"
              asChild={page !== currentPage}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link
                  href={buildPageUrl(
                    slugString,
                    currentSort,
                    defaultSort,
                    page,
                    extraParams,
                  )}
                >
                  {page}
                </Link>
              )}
            </Button>
          ),
        )}
      </div>

      {currentPage < totalPages ? (
        <Button variant="outline" size="sm" asChild>
          <Link
            href={buildPageUrl(
              slugString,
              currentSort,
              defaultSort,
              currentPage + 1,
              extraParams,
            )}
          >
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
