import type { ListingCardData } from "~/server/queries/listings";
import { formatPrice, resolvePriceDisplay } from "~/lib/utils";
import { getPropertyTypeLabel } from "~/lib/data";
import { buildPropertySlug } from "~/lib/property-slug";
import { getWatermarkedImageUrl } from "~/lib/image-url";

interface PropertyMapCardProps {
  listing: ListingCardData;
  watermarkEnabled?: boolean;
}

const RENT_TYPES = new Set(["Rent", "RentWithOption", "RoomSharing"]);

function formatListingType(type: string): string {
  switch (type) {
    case "Sale":
      return "Venta";
    case "Rent":
      return "Alquiler";
    case "RentWithOption":
      return "Alquiler con opción";
    case "RoomSharing":
      return "Habitación";
    case "Transfer":
      return "Traspaso";
    default:
      return type;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function PropertyMapCard({
  listing,
  watermarkEnabled = false,
}: PropertyMapCardProps): string {
  const propertyTypeLabel =
    (listing.propertySubtype?.trim()
      ? getPropertyTypeLabel(listing.propertySubtype)
      : getPropertyTypeLabel(listing.propertyType)) || "Propiedad";
  const listingTypeLabel = formatListingType(listing.listingType);
  const isRent = RENT_TYPES.has(listing.listingType);

  const priceNum = Number(listing.price);
  const hasPrice = !!priceNum && !isNaN(priceNum);
  const price = hasPrice ? formatPrice(priceNum) : "";
  const priceDisplay = resolvePriceDisplay({
    price: listing.price,
    hidePrice: listing.hidePrice,
    status: listing.status,
    isRental: isRent,
  });
  // Inner HTML for the price; empty string → the price line is omitted.
  const priceInner =
    priceDisplay.mode === "hidden"
      ? ""
      : priceDisplay.mode === "consult"
        ? "A consultar"
        : hasPrice
          ? `${price}€${isRent ? '<span style="font-size: 11px; font-weight: 500; color: #6b7280;">/mes</span>' : ""}`
          : "A consultar";
  const bedrooms = listing.bedrooms ?? null;
  const bathrooms = listing.bathrooms
    ? Math.floor(Number(listing.bathrooms))
    : null;
  const sqm = listing.squareMeter ?? null;

  const city = listing.city?.trim() ?? "";
  const municipality = listing.municipality?.trim() ?? "";
  const neighborhood = listing.neighborhood?.trim() ?? "";
  const subdivision =
    neighborhood && neighborhood.toLowerCase() !== city.toLowerCase()
      ? neighborhood
      : city;
  const locationLine =
    municipality && municipality.toLowerCase() !== subdivision.toLowerCase()
      ? `${subdivision}${subdivision ? " · " : ""}${municipality}`
      : subdivision || municipality;

  const fallbackPlaceholder = "/properties/suburban-dream.png";
  const rawImage = listing.imageUrl ?? listing.imageUrl2 ?? "";
  const imageUrl = rawImage
    ? getWatermarkedImageUrl(rawImage, watermarkEnabled) || rawImage
    : fallbackPlaceholder;

  const slug = buildPropertySlug({
    listingId: listing.listingId,
    title: listing.title,
    propertyType: listing.propertyType,
    city: listing.city,
    bedrooms: listing.bedrooms,
    listingType: listing.listingType,
  });
  const listingUrl = `/propiedades/${slug}`;

  const titleText = listing.title?.trim()
    ? listing.title
    : `${propertyTypeLabel}${city ? ` en ${city}` : ""}`;

  const showRooms = ![
    "solar",
    "garaje",
    "edificio",
    "oficina",
    "industrial",
    "trastero",
  ].includes(listing.propertyType?.toLowerCase() ?? "");

  const safeTitle = escapeHtml(titleText);
  const safeLocation = escapeHtml(locationLine || "");
  const safeImage = escapeHtml(imageUrl);
  const safeUrl = escapeHtml(listingUrl);
  const safePropertyTypeLabel = escapeHtml(propertyTypeLabel);
  const safeListingTypeLabel = escapeHtml(listingTypeLabel);
  const safePlaceholder = escapeHtml(fallbackPlaceholder);

  const roomsBlock = showRooms
    ? `
      <div style="display: flex; align-items: center;">
        <svg style="width: 14px; height: 14px; margin-right: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="2" points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>${bedrooms ?? "-"} ${bedrooms === 1 ? "Hab" : "Habs"}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <svg style="width: 14px; height: 14px; margin-right: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 16h20v4H2v-4zM4 6h.01M7 6h10M4 10h16v6H4v-6z"/>
        </svg>
        <span>${bathrooms ?? "-"} ${bathrooms === 1 ? "Baño" : "Baños"}</span>
      </div>
    `
    : "";

  return `
    <div style="width: 280px; font-family: system-ui, -apple-system, sans-serif; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <a href="${safeUrl}" style="text-decoration: none; color: inherit; display: block;">
        <div style="position: relative; height: 170px; background: #f3f4f6;">
          <img
            src="${safeImage}"
            alt="${safeTitle}"
            style="width: 100%; height: 100%; object-fit: cover;"
            onerror="this.onerror=null;this.src='${safePlaceholder}';"
          />
          <div style="position: absolute; top: 8px; left: 8px; background: rgba(255,255,255,0.92); padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #1f2937;">
            ${safeListingTypeLabel}
          </div>
          <div style="position: absolute; top: 8px; right: 8px; background: rgba(17,24,39,0.78); color: white; padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 500;">
            ${safePropertyTypeLabel}
          </div>
        </div>
        <div style="padding: 12px 14px 14px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 600; line-height: 1.3; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #111827;">
              ${safeTitle}
            </h3>
            ${
              priceInner
                ? `<p style="margin: 0; font-size: 15px; font-weight: 700; white-space: nowrap; color: #111827;">${priceInner}</p>`
                : ""
            }
          </div>
          ${
            safeLocation
              ? `<div style="display: flex; align-items: center; margin-bottom: 8px; color: #6b7280; font-size: 12px;">
                  <svg style="width: 14px; height: 14px; margin-right: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${safeLocation}</span>
                </div>`
              : ""
          }
          ${
            listing.fcLocationVisibility && listing.fcLocationVisibility !== 1
              ? `<div style="margin-bottom: 8px; font-size: 11px; color: #9ca3af; font-style: italic;">Ubicación aproximada</div>`
              : ""
          }
          <div style="display: flex; justify-content: flex-start; gap: 12px; font-size: 12px; color: #374151;">
            ${roomsBlock}
            ${
              sqm
                ? `<div style="display: flex; align-items: center;">
                    <svg style="width: 14px; height: 14px; margin-right: 4px; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    </svg>
                    <span>${sqm} m²</span>
                  </div>`
                : ""
            }
          </div>
        </div>
      </a>
    </div>
  `;
}
