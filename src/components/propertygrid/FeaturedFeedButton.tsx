"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ListingCardData } from "~/server/queries/listings";
import { PropertyFeed } from "~/components/propiedades/PropertyFeed";
import { useIsMobile } from "~/components/hooks/use-mobile";
import { PropertyButton } from "./PropertyButton";

interface FeaturedFeedButtonProps {
  text: string;
  listings: ListingCardData[];
  watermarkEnabled: boolean;
}

/**
 * "Ver más" button for the "Propiedades destacadas" teaser: opens the
 * full-screen vertical property feed over the current page instead of
 * navigating to the search results.
 *
 * Mobile only — the vertical photo reel is a touch paradigm (same reasoning as
 * FeedViewToggle, which hides itself above 768px). On desktop the button keeps
 * the default behavior and navigates to the property search.
 *
 * The feed is portalled to <body> because PropertyGridWrapper animates a
 * transform, and a transformed ancestor would become the containing block for
 * the feed's `position: fixed`. It is also mounted only while open — every feed
 * card marks its first image `priority`, so pre-rendering it hidden would fire a
 * dozen high-priority image requests against the hero's LCP on every page load.
 */
export function FeaturedFeedButton({
  text,
  listings,
  watermarkEnabled,
}: FeaturedFeedButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => setIsMounted(true), []);

  return (
    <>
      {/* No onClick on desktop → PropertyButton falls back to navigating to the
          search page, exactly like the non-feed accounts. */}
      <PropertyButton
        text={text}
        onClick={isMobile ? () => setIsOpen(true) : undefined}
      />
      {isMounted &&
        isOpen &&
        isMobile &&
        createPortal(
          <PropertyFeed
            listings={listings}
            watermarkEnabled={watermarkEnabled}
            onClose={() => setIsOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
