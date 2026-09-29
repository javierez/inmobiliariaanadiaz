"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ListingCardData, FeedImage } from "~/server/queries/listings";
import { fetchFeedImages } from "~/server/actions/property-listing";
import { PropertyFeedCard } from "./PropertyFeedCard";
import { applySortParam } from "~/lib/sort-params";

/**
 * Two modes:
 * - route mode (`slugString` given): the `?vista=feed` view of the search
 *   results. Closing navigates back to the list. Historical behavior.
 * - overlay mode (`onClose` given): opened on top of another page (e.g. the
 *   homepage "Propiedades destacadas" teaser). Closing dismisses it in place,
 *   with a body scroll lock, Escape and browser/Android back all wired up.
 */
interface PropertyFeedProps {
  listings: ListingCardData[];
  watermarkEnabled: boolean;
  slugString?: string;
  currentSort?: string;
  /** Orden inicial de la cuenta, para omitir el parámetro cuando coincide. */
  defaultSort?: string;
  /** Active free-text query, preserved when the feed closes. */
  query?: string;
  onClose?: () => void;
}

export function PropertyFeed({
  listings,
  watermarkEnabled,
  slugString,
  currentSort,
  defaultSort = "default",
  query,
  onClose,
}: PropertyFeedProps) {
  const router = useRouter();
  const isOverlay = !!onClose;
  // True once we pushed a history entry, so closing consumes it instead of
  // stranding it (and so cleanup can't double-pop).
  const pushedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageMap, setImageMap] = useState<Record<string, FeedImage[]>>({});
  const [, startTransition] = useTransition();
  const fetchedRef = useRef<Set<string>>(new Set());

  // Fetch images for a batch of property IDs
  const loadImages = useCallback((propertyIds: string[]) => {
    const newIds = propertyIds.filter((id) => !fetchedRef.current.has(id));
    if (newIds.length === 0) return;
    newIds.forEach((id) => fetchedRef.current.add(id));

    startTransition(async () => {
      const result = await fetchFeedImages(newIds);
      setImageMap((prev) => ({ ...prev, ...result }));
    });
  }, []);

  // Load images for first few properties on mount
  useEffect(() => {
    const initialIds = listings.slice(0, 3).map((l) => l.propertyId.toString());
    loadImages(initialIds);
  }, [listings, loadImages]);

  // IntersectionObserver to preload images as user scrolls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number(entry.target.getAttribute("data-index"));
          if (isNaN(index)) continue;
          // Preload current + next 2
          const idsToLoad = listings
            .slice(index, index + 3)
            .map((l) => l.propertyId.toString());
          loadImages(idsToLoad);
        }
      },
      { threshold: 0.3 },
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [listings, loadImages]);

  const handleClose = useCallback(() => {
    if (onClose) {
      // Consume the history entry we pushed on open, so the browser's back
      // stack stays clean. `popstate` then triggers the actual close.
      if (pushedRef.current) {
        window.history.back();
        return;
      }
      onClose();
      return;
    }
    // Closing the feed returns to the grid — keep the active search so the user
    // doesn't land back on unfiltered results.
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    applySortParam(params, currentSort ?? defaultSort, defaultSort);
    const qs = params.toString();
    router.push(`/${slugString}${qs ? `?${qs}` : ""}`);
  }, [onClose, query, currentSort, defaultSort, slugString, router]);

  // Overlay mode only: lock the page behind, close on Escape, and make the
  // browser/Android back gesture dismiss the feed instead of leaving the site.
  // The pushed entry keeps the same URL, so the App Router resolves the same
  // route with no RSC fetch and no scroll jump.
  useEffect(() => {
    if (!onClose) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    const handlePopState = () => {
      pushedRef.current = false;
      onClose();
    };

    window.history.pushState(null, "", window.location.href);
    pushedRef.current = true;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose, handleClose]);

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-2 backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Cerrar vista feed"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Vertical snap scroll container */}
      <div
        ref={containerRef}
        className={`h-[100dvh] snap-y snap-mandatory overflow-y-scroll overscroll-contain ${
          // Letterbox the reel on wide screens so portrait property photos
          // aren't cropped into panoramas. Full-bleed in route mode (mobile).
          isOverlay ? "mx-auto w-full max-w-[520px]" : ""
        }`}
        style={{ scrollbarWidth: "none" }}
      >
        {listings.map((listing, index) => (
          <div key={listing.listingId.toString()} data-index={index}>
            <PropertyFeedCard
              listing={listing}
              images={imageMap[listing.propertyId.toString()] ?? []}
              watermarkEnabled={watermarkEnabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
