"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import {
  Bed,
  Bath,
  SquareIcon as SquareFoot,
  MapPin,
  Building,
} from "lucide-react";
import {
  formatPrice,
  formatNumber,
  getListingReference,
  resolvePriceDisplay,
} from "~/lib/utils";
import type { ListingCardData } from "~/server/queries/listings";
import {
  type CardDisplayConfig,
  DEFAULT_CARD_DISPLAY,
  buildLocationLabel,
} from "~/lib/card-display";
import { getWatermarkedImageUrl } from "~/lib/image-url";
import { getBankOwnedLabel, getPropertyTypeLabel } from "~/lib/data";
import { buildPropertySlug, buildPropertyImageAlt } from "~/lib/property-slug";
import { isAccount137 } from "~/lib/account-overrides/137";

interface PropertyCardProps {
  listing: ListingCardData;
  index?: number;
  watermarkEnabled?: boolean;
  showDescription?: boolean;
  showReference?: boolean;
  cardDisplay?: CardDisplayConfig;
}

export const PropertyCard = React.memo(function PropertyCard({
  listing,
  index = 0,
  watermarkEnabled = false,
  showDescription = true,
  showReference = true,
  cardDisplay = DEFAULT_CARD_DISPLAY,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [image2Loaded, setImage2Loaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for triggering animation when visible
  useEffect(() => {
    if (!listing.isOportunidad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [listing.isOportunidad]);

  // Property types where bedrooms/bathrooms don't apply
  const hideRooms = [
    "solar",
    "garaje",
    "edificio",
    "oficina",
    "industrial",
    "trastero",
  ].includes(listing.propertyType?.toLowerCase() ?? "");
  const useEstancias = listing.propertyType?.toLowerCase() === "local";

  // Get primary image with proper fallback. When the server rewrote imageUrl
  // to a watermarked S3 path, `imageUrlFallback` carries the original
  // un-watermarked URL — try that on error before giving up to the placeholder
  // (the watermarked S3 cache may not be warmed for every listing).
  const defaultPlaceholder = "/properties/suburban-dream.png";
  const [imageSrc, setImageSrc] = useState(
    getWatermarkedImageUrl(listing.imageUrl, watermarkEnabled) ||
      defaultPlaceholder,
  );
  const [imageSrc2, setImageSrc2] = useState(
    getWatermarkedImageUrl(
      listing.imageUrl2 ?? listing.imageUrl,
      watermarkEnabled,
    ) || defaultPlaceholder,
  );
  const [imageFallbackUsed, setImageFallbackUsed] = useState(false);
  const [image2FallbackUsed, setImage2FallbackUsed] = useState(false);

  const onImageError = () => {
    if (
      !imageFallbackUsed &&
      listing.imageUrlFallback &&
      imageSrc !== listing.imageUrlFallback
    ) {
      setImageFallbackUsed(true);
      setImageSrc(listing.imageUrlFallback);
      return;
    }
    setImageSrc(defaultPlaceholder);
  };

  const onImage2Error = () => {
    const fb = listing.imageUrl2Fallback ?? listing.imageUrlFallback;
    if (!image2FallbackUsed && fb && imageSrc2 !== fb) {
      setImage2FallbackUsed(true);
      setImageSrc2(fb);
      return;
    }
    setImageSrc2(defaultPlaceholder);
  };

  const imageAlt = buildPropertyImageAlt({
    title: listing.title,
    propertyType: listing.propertyType,
    city: listing.city,
    bedrooms: listing.bedrooms,
    squareMeter: listing.squareMeter,
    listingType: listing.listingType,
  });

  // Card heading + location line are configurable per account (cardDisplay).
  // Street is never shown — the title falls back to the property type.
  const locationLabel = buildLocationLabel(
    listing,
    cardDisplay.cardLocationField,
  );
  const headingText =
    cardDisplay.cardTitle === "location" ? locationLabel : listing.title;
  // Prefer the subtype ("Nave industrial") over the raw type ("Local"), mirroring
  // the top-left card chip so naves read as naves everywhere.
  const typeLabel = listing.propertySubtype?.trim()
    ? getPropertyTypeLabel(listing.propertySubtype)
    : getPropertyTypeLabel(listing.propertyType);
  const heading = headingText || typeLabel || "Propiedad";
  const showHeading = cardDisplay.cardTitle !== "none";
  // Eyebrow shows the location, but not when the title already does.
  const showLocationRow =
    cardDisplay.cardEyebrow === "location" &&
    cardDisplay.cardTitle !== "location" &&
    !!locationLabel;

  // Shared data (used by both the default and the account-137 layouts).
  const acct137 = isAccount137();
  const isRental = ["Rent", "RentWithOption", "RoomSharing"].includes(
    listing.listingType,
  );
  const priceDisplay = resolvePriceDisplay({
    price: listing.price,
    hidePrice: listing.hidePrice,
    status: listing.status,
    isRental,
  });
  const descriptionText =
    listing.description?.replace(/\s*con\s+null\s+habitaciones/gi, "") ||
    `${typeLabel}${(listing.squareMeter ?? 0) > 0 ? ` de ${formatNumber(listing.squareMeter ?? 0)} m²` : ""}${!hideRooms && listing.bedrooms != null && listing.bedrooms > 0 ? ` con ${listing.bedrooms} ${useEstancias ? "estancias" : "habitaciones"}` : ""}`;
  const hasBeds =
    !hideRooms && listing.bedrooms != null && listing.bedrooms > 0;
  const hasBaths =
    !hideRooms && listing.bathrooms != null && Number(listing.bathrooms) > 0;
  const hasArea = (listing.squareMeter ?? 0) > 0;
  const hasStats = hasBeds || hasBaths || hasArea;
  const statsInner = (
    <>
      {hasBeds && (
        <div className="flex items-center">
          <Bed className="mr-1 h-5 w-5" />
          <span>
            {listing.bedrooms}{" "}
            {useEstancias
              ? listing.bedrooms === 1
                ? "Est"
                : "Ests"
              : listing.bedrooms === 1
                ? "Hab"
                : "Habs"}
          </span>
        </div>
      )}
      {hasBaths && (
        <div className="flex items-center">
          <Bath className="mr-1 h-5 w-5" />
          <span>
            {Math.floor(Number(listing.bathrooms))}{" "}
            {Math.floor(Number(listing.bathrooms)) === 1 ? "Baño" : "Baños"}
          </span>
        </div>
      )}
      {hasArea && (
        <div className="flex items-center">
          <SquareFoot className="mr-1 h-5 w-5" />
          <span>{formatNumber(listing.squareMeter ?? 0)} m²</span>
        </div>
      )}
    </>
  );

  return (
    <Link
      href={`/propiedades/${buildPropertySlug({
        listingId: listing.listingId,
        title: listing.title,
        propertyType: listing.propertyType,
        city: listing.city,
        bedrooms: listing.bedrooms,
        listingType: listing.listingType,
      })}`}
      className="block"
      role="article"
      aria-label={imageAlt}
    >
      <Card
        ref={cardRef}
        className={`flex h-full flex-col overflow-hidden transition-all hover:shadow-lg ${listing.isOportunidad && isVisible ? "animate-oportunidad" : ""}`}
        style={
          listing.isOportunidad && isVisible
            ? { animationDelay: `${index * 200}ms` }
            : undefined
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="relative h-full w-full">
            {/* First Image */}
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-0" : "opacity-100"
              } ${imageSrc === defaultPlaceholder || listing.status === "Sold" || listing.status === "Vendido" ? "grayscale" : ""}`}
              priority={index < 3}
              loading={index < 3 ? undefined : "lazy"}
              onLoad={() => setImageLoaded(true)}
              onError={onImageError}
              quality={50}
            />
            {/* Second Image */}
            <Image
              src={imageSrc2}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              } ${imageSrc2 === defaultPlaceholder || listing.status === "Sold" || listing.status === "Vendido" ? "grayscale" : ""}`}
              loading="lazy"
              onLoad={() => setImage2Loaded(true)}
              onError={onImage2Error}
              quality={50}
            />
            {(!imageLoaded || !image2Loaded) && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
          </div>
          {/* Top Left - Property subtype (Ático, Chalet…), falling back to type */}
          <Badge
            variant="outline"
            className="absolute left-2 top-2 z-10 bg-white/80 text-sm"
          >
            {listing.propertySubtype?.trim()
              ? getPropertyTypeLabel(listing.propertySubtype)
              : getPropertyTypeLabel(listing.propertyType)}
          </Badge>

          {/* Top Right - Primary market status (En Venta / En Alquiler).
              Hidden only for terminal states, which take over via the overlay. */}
          {!!listing.status &&
            listing.status !== "Vendido" &&
            listing.status !== "Alquilado" && (
              <Badge
                variant="outline"
                className="absolute right-2 top-2 z-10 whitespace-nowrap border-0 bg-slate-900/55 text-sm text-white shadow-sm backdrop-blur-md"
              >
                {listing.status}
              </Badge>
            )}

          {/* Center overlay — bold pill for terminal states only. */}
          {(listing.status === "Vendido" || listing.status === "Alquilado") && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <span className="whitespace-nowrap rounded-full bg-rose-600/95 px-8 py-3 text-base font-semibold uppercase tracking-[0.3em] text-white shadow-2xl ring-1 ring-rose-500/40 backdrop-blur-md">
                {listing.status}
              </span>
            </div>
          )}

          {/* Reservado — centered pill matching the Vendido overlay (same
              position & size) but amber, and without graying the photo since
              the listing is still on the market. Never on terminal listings. */}
          {listing.reservado &&
            listing.status !== "Vendido" &&
            listing.status !== "Alquilado" && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <span className="whitespace-nowrap rounded-full bg-amber-500/95 px-8 py-3 text-base font-semibold uppercase tracking-[0.3em] text-white shadow-2xl ring-1 ring-amber-400/40 backdrop-blur-md">
                  Reservado
                </span>
              </div>
            )}

          {/* Bottom Center - Flag stack (above reference) */}
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1">
            {!!listing.isBankOwned && (
              <Badge
                variant="outline"
                className="whitespace-nowrap border-0 bg-amber-50/80 px-3 py-1 text-xs text-amber-800 shadow-md backdrop-blur-sm"
              >
                {getBankOwnedLabel(listing.propertyType)}
              </Badge>
            )}
            {!!listing.isFeatured && (
              <Badge
                variant="outline"
                className="whitespace-nowrap border-0 bg-yellow-50/90 px-3 py-1 text-xs text-yellow-800 shadow-md backdrop-blur-sm"
              >
                Destacado
              </Badge>
            )}
            {!!listing.isOportunidad && (
              <Badge
                variant="outline"
                className="whitespace-nowrap border-0 bg-orange-50/90 px-3 py-1 text-xs text-orange-800 shadow-md backdrop-blur-sm"
              >
                Oportunidad
              </Badge>
            )}
          </div>
        </div>

        {acct137 ? (
          /* Account 137 — editorial hierarchy: eyebrow → price (dominant) →
             title → description → stats (divider) → subtle ref. */
          <CardContent className="flex flex-1 flex-col p-4">
            {showLocationRow && (
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{locationLabel}</span>
              </div>
            )}

            {priceDisplay.mode !== "hidden" && (
              <p className="text-2xl font-bold leading-none text-price">
                {priceDisplay.text}
              </p>
            )}

            {showDescription && (
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                {descriptionText}
              </p>
            )}

            {hasStats && (
              <div className="mt-3 flex items-center gap-5 border-t pt-3 text-sm text-muted-foreground">
                {statsInner}
              </div>
            )}

            {showReference && (
              <div className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground/70">
                Ref. {getListingReference(listing)}
              </div>
            )}
          </CardContent>
        ) : (
          <CardContent className="flex flex-1 flex-col p-3">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0 max-w-[60%] flex-1">
                {showHeading && (
                  <h3 className="flex items-center gap-1 truncate text-base font-semibold">
                    {cardDisplay.cardTitle === "location" && (
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    {heading}
                  </h3>
                )}
              </div>
              {priceDisplay.mode !== "hidden" && (
                <p className="shrink-0 text-base font-bold text-price">
                  {priceDisplay.text}
                </p>
              )}
            </div>

            {showLocationRow && (
              <div className="mb-2 flex items-center text-muted-foreground">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                <p className="line-clamp-1 text-sm">{locationLabel}</p>
              </div>
            )}

            {showDescription && (
              <p className="mb-3 line-clamp-3 flex-1 text-sm text-muted-foreground sm:mb-4 sm:text-base">
                {descriptionText}
              </p>
            )}

            {hasStats && (
              <div className="mt-auto flex justify-between text-sm">
                {statsInner}
              </div>
            )}

            {showReference && (
              <div className="mt-3 flex items-center border-t pt-2 text-xs text-muted-foreground">
                <Building className="mr-1 h-3 w-3" />
                <span>Ref: {getListingReference(listing)}</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Link>
  );
});
