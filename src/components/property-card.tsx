"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  Bed,
  Bath,
  SquareIcon as SquareFoot,
  MapPin,
  Building,
} from "lucide-react";
import {
  getBankOwnedLabel,
  getPropertyTypeLabel,
  type Property,
} from "~/lib/data";
import { getWatermarkedImageUrl } from "~/lib/image-url";
import { buildPropertySlug, buildPropertyImageAlt } from "~/lib/property-slug";
import { resolvePriceDisplay } from "~/lib/utils";

interface PropertyCardProps {
  property: Property;
  watermarkEnabled?: boolean;
  showDescription?: boolean;
}

export function PropertyCard({
  property,
  watermarkEnabled = false,
  showDescription = true,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Property types where bedrooms/bathrooms don't apply
  const hideRooms = [
    "solar",
    "garaje",
    "edificio",
    "oficina",
    "industrial",
    "trastero",
  ].includes(property.propertyType?.toLowerCase());
  const useEstancias = property.propertyType?.toLowerCase() === "local";

  // Get primary and secondary images with proper fallbacks
  const defaultPlaceholder = "/properties/suburban-dream.png";
  const rawPrimaryImage =
    property.imageUrl && property.imageUrl !== ""
      ? property.imageUrl
      : defaultPlaceholder;
  const primaryImage =
    getWatermarkedImageUrl(rawPrimaryImage, watermarkEnabled) ||
    defaultPlaceholder;

  // For secondary image, use the second image from the array or fall back to primary image
  const rawSecondaryImage = property.images?.[1]?.url ?? rawPrimaryImage;
  const secondaryImage =
    getWatermarkedImageUrl(rawSecondaryImage, watermarkEnabled) || primaryImage;

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  const priceDisplay = resolvePriceDisplay({
    price: property.price,
    hidePrice: property.hidePrice,
    status: property.status,
    isRental: property.status === "for-rent" || property.status === "rented",
  });

  const listingType =
    property.status === "for-rent" || property.status === "rented"
      ? "Rent"
      : "Sale";
  const slug = buildPropertySlug({
    listingId: property.listingId ?? property.id,
    title: property.title,
    propertyType: property.propertyType,
    city: property.city,
    bedrooms: property.bedrooms,
    listingType,
  });
  const propertyHref = `/propiedades/${slug}`;
  const imageAlt = buildPropertyImageAlt({
    title: property.title,
    propertyType: property.propertyType,
    city: property.city,
    bedrooms: property.bedrooms,
    squareMeter: property.squareFeet,
    listingType,
  });

  return (
    <Card
      className="w-full overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={propertyHref}>
          <div className="relative h-full w-full">
            <Image
              src={primaryImage || "/placeholder.svg"}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              quality={50}
            />
            <Image
              src={secondaryImage || "/placeholder.svg"}
              alt={`${imageAlt} - Vista alternativa`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              quality={50}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
          </div>
        </Link>
        <Badge className="absolute right-2 top-2 z-10 text-xs sm:text-sm">
          {property.status === "sold"
            ? "Vendido"
            : property.status === "rented"
              ? "Alquilado"
              : property.reservado
                ? "Reservado"
                : property.status === "for-rent"
                  ? "En Alquiler"
                  : "En Venta"}
        </Badge>
        <Badge
          variant="outline"
          className="absolute left-2 top-2 z-10 bg-white/80 text-xs sm:text-sm"
        >
          {getPropertyTypeLabel(property.propertyType)}
        </Badge>
        {!!property.isBankOwned && (
          <Badge
            variant="outline"
            className="absolute bottom-2 left-2 z-10 border-0 bg-amber-50/80 text-[10px] text-amber-800 shadow-md backdrop-blur-sm sm:text-xs"
          >
            {getBankOwnedLabel(property.propertyType)}
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between">
          <Link
            href={propertyHref}
            className="transition-colors hover:text-primary"
          >
            <h3 className="line-clamp-1 text-base font-semibold sm:text-lg">
              {property.title}
            </h3>
          </Link>
          {priceDisplay.mode !== "hidden" && (
            <p className="text-base font-bold text-price sm:text-lg">
              {priceDisplay.text}
            </p>
          )}
        </div>

        <div className="mb-3 flex items-center text-muted-foreground">
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <p className="line-clamp-1 text-sm sm:text-base">
            {[
              property.address,
              ...new Set([property.city, property.state].filter(Boolean)),
            ]
              .filter(Boolean)
              .join(", ")}
            {property.zipCode ? ` ${property.zipCode}` : ""}
          </p>
        </div>

        {showDescription && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground sm:mb-4 sm:text-base">
            {property.description}
          </p>
        )}

        <div className="flex justify-between gap-2">
          {!hideRooms && property.bedrooms != null && property.bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="mr-1 h-4 w-4" />
              <span className="text-sm sm:text-base">
                {property.bedrooms}{" "}
                {useEstancias
                  ? property.bedrooms === 1
                    ? "Est"
                    : "Ests"
                  : property.bedrooms === 1
                    ? "Hab"
                    : "Habs"}
              </span>
            </div>
          )}
          {!hideRooms &&
            property.bathrooms != null &&
            Number(property.bathrooms) > 0 && (
              <div className="flex items-center">
                <Bath className="mr-1 h-4 w-4" />
                <span className="text-sm sm:text-base">
                  {property.bathrooms}{" "}
                  {property.bathrooms === 1 ? "Baño" : "Baños"}
                </span>
              </div>
            )}
          {property.squareFeet > 0 && (
            <div className="flex items-center">
              <SquareFoot className="mr-1 h-4 w-4" />
              <span className="text-sm sm:text-base">
                {formatNumber(property.squareFeet)} m²
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center border-t pt-3 text-sm text-muted-foreground">
          <Building className="mr-1 h-3 w-3" />
          <span>Ref: {property.listingId}</span>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 sm:p-4">
        <Link
          href={propertyHref}
          className="w-full text-center text-sm font-medium text-primary hover:underline sm:text-base"
        >
          Ver Detalles
        </Link>
      </CardFooter>
    </Card>
  );
}
