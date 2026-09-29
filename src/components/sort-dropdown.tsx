"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SlidersHorizontal, Check } from "lucide-react";
import { applySortParam } from "~/lib/sort-params";

const sortOptions = [
  { value: "default", label: "Destacados primero" },
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "size-asc", label: "Tamaño: menor a mayor" },
  { value: "size-desc", label: "Tamaño: mayor a menor" },
] as const;

interface SortDropdownProps {
  slugString: string;
  currentSort?: string;
  /** Orden inicial de la cuenta, para omitir el parámetro cuando coincide. */
  defaultSort?: string;
  /** Active free-text query, carried across so sorting doesn't drop it. */
  query?: string;
}

export function SortDropdown({
  slugString,
  currentSort = "default",
  defaultSort = "default",
  query,
}: SortDropdownProps) {
  const activeLabel =
    sortOptions.find((o) => o.value === currentSort)?.label ?? "Ordenar";

  const buildHref = (sortValue: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    applySortParam(params, sortValue, defaultSort);
    const qs = params.toString();
    return `/${slugString}${qs ? `?${qs}` : ""}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 rounded-full border-border/60 px-5 text-sm font-normal"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {activeLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {sortOptions.map((option) => (
          <DropdownMenuItem key={option.value} asChild>
            <Link
              href={buildHref(option.value)}
              className="flex w-full items-center justify-between"
            >
              {option.label}
              {currentSort === option.value && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
