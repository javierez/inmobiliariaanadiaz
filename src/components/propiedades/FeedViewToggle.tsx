"use client";

import Link from "next/link";
import { Smartphone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/components/hooks/use-mobile";
import { applySortParam } from "~/lib/sort-params";

interface FeedViewToggleProps {
  slugString: string;
  currentSort: string;
  /** Orden inicial de la cuenta, para omitir el parámetro cuando coincide. */
  defaultSort?: string;
  /** Active free-text query, carried across so the view toggle keeps it. */
  query?: string;
}

export function FeedViewToggle({
  slugString,
  currentSort,
  defaultSort = "default",
  query,
}: FeedViewToggleProps) {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  params.set("vista", "feed");
  if (currentSort) applySortParam(params, currentSort, defaultSort);

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/${slugString}?${params.toString()}`}>
        <Smartphone className="mr-2 h-4 w-4" />
        Explorar
      </Link>
    </Button>
  );
}
