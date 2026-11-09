import {
  findListingByExactReference,
  getListingDetails,
} from "~/server/queries/listings";
import { stripReferencePrefix } from "~/lib/text-normalize";
import { buildPropertySlug } from "~/lib/property-slug";
import { toPublicDetailLocation } from "~/lib/location-privacy";

/**
 * Ruta canónica de la ficha cuando `query` es la referencia de un único
 * inmueble publicado ("P008800", "Ref. PA-1023"); null en cualquier otro caso
 * (texto con espacios, ninguna coincidencia o varias).
 *
 * El slug se construye igual que en propiedades/[id]/page.tsx, así la ficha no
 * vuelve a redirigir al llegar.
 */
export async function getReferenceTargetPath(
  query: string,
): Promise<string | null> {
  const reference = stripReferencePrefix(query.trim());
  if (!reference || /\s/.test(reference)) return null;

  const listingId = await findListingByExactReference(reference);
  if (!listingId) return null;

  const details = await getListingDetails(Number(listingId));
  const property = details ? toPublicDetailLocation(details) : null;
  if (!property) return `/propiedades/${listingId}`;

  const slug = buildPropertySlug({
    listingId: property.listingId,
    title: property.title,
    propertyType: property.propertyType,
    propertySubtype: property.propertySubtype,
    city: property.city,
    bedrooms: property.bedrooms,
    listingType: property.listingType,
  });
  return `/propiedades/${slug}`;
}
