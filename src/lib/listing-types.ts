/**
 * Qué `listings.listing_type` cuenta como compra y cuál como alquiler.
 *
 * Fuente única para el filtro Comprar/Alquilar, el rango de precios y las
 * tarjetas ("/mes"). Antes el filtro de venta era solo `Sale`, así que los
 * traspasos (17 publicados) no salían ni en Comprar ni en Alquilar; y las
 * tarjetas trataban `RoomSharing` como alquiler mientras la búsqueda no.
 *
 * Pure + client-safe.
 */
export const SALE_LISTING_TYPES = ["Sale", "Transfer"] as const;
export const RENT_LISTING_TYPES = [
  "Rent",
  "RentWithOption",
  "RoomSharing",
] as const;

export function isRentalListingType(listingType?: string | null): boolean {
  return (RENT_LISTING_TYPES as readonly string[]).includes(listingType ?? "");
}

/** "En Venta" / "En Alquiler" / "En Traspaso", o null si no es ninguna. */
export function operationLabel(listingType?: string | null): string | null {
  if (listingType === "Sale") return "En Venta";
  if (listingType === "Transfer") return "En Traspaso";
  if (isRentalListingType(listingType)) return "En Alquiler";
  return null;
}

/**
 * ¿Reservado? Se marca de dos maneras: el estado guardado 'Reservado' (lo pone
 * la agencia o su importación) y el derivado de un trato vivo (`reservado`).
 */
export function isReservedListing(listing: {
  status?: string | null;
  reservado?: boolean | null;
}): boolean {
  return !!listing.reservado || listing.status === "Reservado";
}

/**
 * Etiqueta de estado de la ficha: Vendido / Alquilado / Reservado / En Venta /
 * En Alquiler. Una sola para la ficha estándar, el resumen de la cuenta 137 y
 * el mapa: el resumen decía "En Venta" de un piso vendido o reservado mientras
 * su tarjeta enseñaba el sello VENDIDO / RESERVADO.
 */
export function listingStatusLabel(listing: {
  status?: string | null;
  reservado?: boolean | null;
  listingType?: string | null;
}): string {
  if (listing.status === "Vendido" || listing.status === "Alquilado") {
    return listing.status;
  }
  if (isReservedListing(listing)) return "Reservado";
  return operationLabel(listing.listingType) ?? listing.status ?? "";
}
