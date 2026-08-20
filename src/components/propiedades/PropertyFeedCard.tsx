"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Bed, Bath, SquareIcon as SquareFoot, MapPin } from "lucide-react";
import { formatNumber, resolvePriceDisplay } from "~/lib/utils";
import type { ListingCardData, FeedImage } from "~/server/queries/listings";
import { getWatermarkedImageUrl } from "~/lib/image-url";
import { getBankOwnedLabel } from "~/lib/data";
import { buildPropertySlug, buildPropertyImageAlt } from "~/lib/property-slug";

/** How many photo dots are ever on screen, however many photos a listing has. */
const MAX_DOTS = 7;

interface PropertyFeedCardProps {
  listing: ListingCardData;
  images: FeedImage[];
  watermarkEnabled: boolean;
}

export function PropertyFeedCard({
  listing,
  images,
  watermarkEnabled,
}: PropertyFeedCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build image list: use fetched images, fallback to listing's 2 images
  const imageUrls =
    images.length > 0
      ? images.map((img) =>
          getWatermarkedImageUrl(img.imageUrl, watermarkEnabled),
        )
      : [
          getWatermarkedImageUrl(listing.imageUrl, watermarkEnabled),
          getWatermarkedImageUrl(listing.imageUrl2, watermarkEnabled),
        ].filter(Boolean);

  const totalImages = imageUrls.length;

  // The visible slice of dots: keeps the current photo centred in the row and
  // clamps at both ends, so the row is always MAX_DOTS wide (or fewer when the
  // listing has fewer photos) and never jumps.
  const dotWindow = (() => {
    const visible = Math.min(MAX_DOTS, totalImages);
    const start = Math.max(
      0,
      Math.min(currentIndex - Math.floor(visible / 2), totalImages - visible),
    );
    return Array.from({ length: visible }, (_, i) => start + i);
  })();

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || totalImages <= 1) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(Math.min(index, totalImages - 1));
  }, [totalImages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const {
    title,
    street,
    price,
    hidePrice,
    listingType,
    propertyType,
    propertySubtype,
    bedrooms,
    bathrooms,
    squareMeter,
    city,
    province,
    isBankOwned,
    isOportunidad,
    isFeatured,
    status,
    reservado,
    listingId,
  } = listing;

  const displayTitle = title ?? street ?? "Propiedad";
  // Top-left badge prefers the more specific subtype, falling back to the type.
  const displayType = propertySubtype?.trim() || propertyType || null;
  const isRental = listingType === "Rent" || listingType === "RentWithOption";
  const imageAlt = buildPropertyImageAlt({
    title,
    propertyType,
    city,
    bedrooms,
    squareMeter,
    listingType,
  });
  const showBeds =
    propertyType !== "solar" &&
    propertyType !== "garaje" &&
    propertyType !== "trastero" &&
    (bedrooms ?? 0) > 0;
  const showBaths =
    propertyType !== "solar" &&
    propertyType !== "garaje" &&
    propertyType !== "trastero" &&
    parseFloat(bathrooms ?? "0") > 0;

  return (
    <div className="relative h-[100dvh] w-full snap-start snap-always">
      {/* Horizontal photo scroller */}
      <div
        ref={scrollRef}
        // overflow-y-hidden matters: with only overflow-x set, the computed
        // overflow-y becomes "auto", so this scroller swallows vertical wheel /
        // drag gestures instead of letting them page the feed behind it.
        className="flex h-full w-full snap-x snap-mandatory overflow-y-hidden overflow-x-scroll"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {imageUrls.length > 0 ? (
          imageUrls.map((url, i) => (
            <div
              key={i}
              className="relative h-full w-full flex-shrink-0 snap-start snap-always overflow-hidden bg-neutral-950"
            >
              {/* Property photos are landscape but the card is a portrait
                  viewport. `object-cover` cropped the sides away, so the photo
                  is now contained in full, with a zoomed blurred copy filling
                  the letterbox behind it. */}
              <Image
                src={url}
                alt=""
                aria-hidden
                fill
                className="scale-110 object-cover blur-2xl brightness-[0.55]"
                sizes="100vw"
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
              />
              <Image
                src={url}
                alt={`${imageAlt} - Foto ${i + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-900">
            <span className="text-white/50">Sin fotos</span>
          </div>
        )}
      </div>

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Photo position: a fixed-width row of dots at the bottom of the screen.
          Listings can have 50+ photos, so the row never grows past MAX_DOTS —
          it slides along with the current photo and the dots at either end
          shrink to signal there are more in that direction. */}
      {totalImages > 1 && (
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
          {dotWindow.map((imageIndex) => {
            const isActive = imageIndex === currentIndex;
            // A dot sitting at the window edge while more photos exist beyond
            // it renders smaller, the way TikTok/Instagram fade their ends.
            const isEdge =
              !isActive &&
              ((imageIndex === dotWindow[0] && imageIndex > 0) ||
                (imageIndex === dotWindow[dotWindow.length - 1] &&
                  imageIndex < totalImages - 1));
            return (
              <div
                key={imageIndex}
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "h-2 w-2 bg-white"
                    : isEdge
                      ? "h-1 w-1 bg-white/30"
                      : "h-1.5 w-1.5 bg-white/50"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Property info overlay */}
      {/* pb leaves room for the dot row pinned at the bottom of the screen. */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-10">
        {/* Badges */}
        <div className="mb-2 flex items-center gap-2">
          {displayType && (
            <Badge
              variant="secondary"
              className="bg-white/20 text-white backdrop-blur-sm"
            >
              {displayType.charAt(0).toUpperCase() + displayType.slice(1)}
            </Badge>
          )}
          {!!status && (
            <Badge
              variant="secondary"
              className="bg-white/20 text-white backdrop-blur-sm"
            >
              {status}
            </Badge>
          )}
          {reservado && status !== "Vendido" && status !== "Alquilado" && (
            <Badge className="bg-amber-500/90 text-white backdrop-blur-sm">
              Reservado
            </Badge>
          )}
          {isBankOwned && (
            <Badge className="bg-blue-600/80 text-white backdrop-blur-sm">
              {getBankOwnedLabel(propertyType)}
            </Badge>
          )}
          {isOportunidad && (
            <Badge className="bg-orange-500/90 text-white backdrop-blur-sm">
              Oportunidad
            </Badge>
          )}
          {isFeatured && (
            <Badge className="bg-yellow-500/90 text-white backdrop-blur-sm">
              Destacado
            </Badge>
          )}
        </div>

        {/* Title - tappable link */}
        <Link
          href={`/propiedades/${buildPropertySlug({
            listingId,
            title,
            propertyType,
            city,
            bedrooms,
            listingType,
          })}`}
        >
          <h2 className="mb-1 text-xl font-bold text-white underline decoration-white/40 underline-offset-2">
            {displayTitle}
          </h2>
        </Link>

        {/* Price */}
        {(() => {
          const priceDisplay = resolvePriceDisplay({
            price,
            hidePrice,
            status,
            isRental,
          });
          if (priceDisplay.mode === "hidden") return null;
          return (
            <p className="mb-2 text-2xl font-extrabold text-white">
              {priceDisplay.text}
            </p>
          );
        })()}

        {/* Location */}
        {(city ?? province) && (
          <div className="mb-3 flex items-center text-white/80">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <span className="text-sm">
              {[city, province].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-4 text-sm text-white/90">
          {showBeds && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{bedrooms} Hab</span>
            </div>
          )}
          {showBaths && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{bathrooms} Baños</span>
            </div>
          )}
          {(squareMeter ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <SquareFoot className="h-4 w-4" />
              <span>{formatNumber(squareMeter!)} m²</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
