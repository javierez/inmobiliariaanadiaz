import Image from "next/image";
import Link from "next/link";
import {
  formatNumber,
  getListingReference,
  resolvePriceDisplay,
} from "~/lib/utils";
import { isRentalListingType } from "~/lib/listing-types";
import { roomsPhrase, showsRooms } from "~/lib/property-rooms";
import type { ListingCardData } from "~/server/queries/listings";
import { getWatermarkedImageUrl } from "~/lib/image-url";
import { getPropertyTypeLabel } from "~/lib/data";
import { buildPropertySlug, buildPropertyImageAlt } from "~/lib/property-slug";

interface PromotionListingCardProps {
  listing: ListingCardData;
  watermarkEnabled?: boolean;
}

export function PromotionListingCard({
  listing,
  watermarkEnabled = false,
}: PromotionListingCardProps) {
  const typeLabel =
    (listing.propertySubtype?.trim()
      ? getPropertyTypeLabel(listing.propertySubtype)
      : getPropertyTypeLabel(listing.propertyType)) || "Propiedad";
  const title = listing.title?.trim() || typeLabel;
  // La misma referencia que la tarjeta del listado y la ficha (la de
  // Idealista si la hay); antes aquí salía el id interno.
  const ref = getListingReference(listing);
  const priceDisplay = resolvePriceDisplay({
    price: listing.price,
    hidePrice: listing.hidePrice,
    status: listing.status,
    isRental: isRentalListingType(listing.listingType),
  });

  // Superficie, habitaciones y baños con las reglas del resto de tarjetas: la
  // superficie es la que se muestra en todas (en un solar, la parcela: no son
  // "m² útiles") y sin habitaciones donde no aplican.
  const roomsApply = showsRooms(listing.propertyType, listing.propertySubtype);
  const specs: string[] = [];
  if (listing.squareMeter)
    specs.push(`${formatNumber(listing.squareMeter)} m²`);
  if (roomsApply && listing.bedrooms)
    specs.push(roomsPhrase(listing.bedrooms, listing.propertyType));
  if (roomsApply && listing.bathrooms) {
    const baths = Math.floor(parseFloat(listing.bathrooms));
    if (!Number.isNaN(baths) && baths > 0)
      specs.push(`${baths} ${baths === 1 ? "baño" : "baños"}`);
  }

  const imageUrl = listing.imageUrl
    ? getWatermarkedImageUrl(listing.imageUrl, watermarkEnabled)
    : null;

  const imageAlt = buildPropertyImageAlt({
    title: listing.title,
    propertyType: listing.propertyType,
    propertySubtype: listing.propertySubtype,
    city: listing.city,
    bedrooms: listing.bedrooms,
    squareMeter: listing.squareMeter,
    listingType: listing.listingType,
  });

  return (
    <Link
      href={`/propiedades/${buildPropertySlug({
        listingId: listing.listingId,
        title: listing.title,
        propertyType: listing.propertyType,
        propertySubtype: listing.propertySubtype,
        city: listing.city,
        bedrooms: listing.bedrooms,
        listingType: listing.listingType,
      })}`}
      className="group flex items-stretch gap-4 rounded-xl border border-border/60 bg-background p-3 transition-colors hover:border-foreground/30"
    >
      <div className="relative h-24 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-32">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Sin foto
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="truncate text-sm font-medium text-foreground sm:text-base">
          {title}
          <span className="ml-1 text-xs font-normal uppercase tracking-eyebrow text-muted-foreground">
            · Ref {ref}
          </span>
        </h3>
        {specs.length > 0 && (
          <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
            {specs.join(" | ")}
          </p>
        )}
        {priceDisplay.mode !== "hidden" && (
          <p className="mt-2 text-sm font-medium text-price sm:text-base">
            {priceDisplay.text}
          </p>
        )}
      </div>
    </Link>
  );
}
