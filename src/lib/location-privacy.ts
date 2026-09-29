/**
 * Lo que la web puede publicar de la ubicación de un inmueble, según su
 * `fc_location_visibility`: 1 = exacta, 2 = calle (sin número), 3 = zona.
 *
 * Se aplica en el SERVIDOR, antes de que el dato llegue al navegador. Antes la
 * ficha y el mapa lo ocultaban solo al pintar: la calle completa y las
 * coordenadas exactas iban igualmente en el código de la página (props de los
 * componentes de cliente, JSON-LD, enlace a Google Maps), así que un inmueble
 * marcado "solo zona" enseñaba su portal a quien mirara el código fuente.
 *
 * Pure + client-safe.
 */

/**
 * "Calle Mayor, 12" → "Calle Mayor"; "12B Calle Mayor" → "Calle Mayor";
 * "Plaza Mayor 1 24002 Leon" → "Plaza Mayor". Muchas calles importadas llevan
 * detrás el código postal y la ciudad, y el número quedaba en medio, a salvo
 * de la regla que solo miraba el final.
 */
export function streetWithoutNumber(street: string): string {
  return street
    .replace(/[\s,]+\d{5}(?:\D.*)?$/, "")
    .replace(/,?\s*\d+[A-Za-z]?\s*$/g, "")
    .replace(/^\d+[A-Za-z]?\s*,?\s*/g, "")
    .trim();
}

/** La calle que se puede enseñar: entera, sin número o ninguna. */
export function publicStreet(
  street: string | null | undefined,
  visibility: number | null | undefined,
): string | null {
  if (!street) return null;
  const v = visibility ?? 1;
  if (v === 1) return street;
  if (v === 2) return streetWithoutNumber(street) || null;
  return null;
}

// Hash determinista [0, 1) a partir del id: el desplazamiento es estable entre
// cargas (si no, el punto se movería cada vez y promediando se encontraría).
function hashUnit(seed: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/** Desplaza un punto hasta `meters` metros, de forma estable por `seed`. */
function offsetCoords(
  lat: number,
  lng: number,
  meters: number,
  seed: string,
): { lat: number; lng: number } {
  // Distribución uniforme en un disco: r = R·√u, θ = 2πv.
  const r = meters * Math.sqrt(hashUnit(seed, 1));
  const theta = 2 * Math.PI * hashUnit(seed, 2);
  const dLat = (r * Math.cos(theta)) / 111320;
  const dLng = (r * Math.sin(theta)) / (111320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

/**
 * Desplazamiento de la ficha: la mitad del círculo que pinta su mapa (150 m en
 * "calle", 300 m en "zona"), así el inmueble sigue dentro del círculo sin que
 * el centro lo delate. Con visibilidad exacta no se toca: la ficha pone el pin.
 */
const DETAIL_OFFSET_METERS: Record<number, number> = { 2: 75, 3: 150 };

/**
 * Desplazamiento de los pines del mapa de resultados. Ese mapa no enseña nunca
 * una dirección exacta, ni siquiera con visibilidad 1: como mínimo, a nivel de
 * calle.
 */
const MAP_PIN_OFFSET_METERS: Record<number, number> = { 1: 80, 2: 80, 3: 350 };

function blurred(
  latitude: string | number | null | undefined,
  longitude: string | number | null | undefined,
  meters: number | undefined,
  seed: string,
): { latitude: string | null; longitude: string | null } {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (latitude == null || longitude == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { latitude: null, longitude: null };
  }
  if (!meters) return { latitude: String(latitude), longitude: String(longitude) };
  const p = offsetCoords(lat, lng, meters, seed);
  return { latitude: p.lat.toFixed(6), longitude: p.lng.toFixed(6) };
}

interface LocatedListing {
  listingId: string | number | bigint;
  street: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  fcLocationVisibility: number | null;
}

/** Ubicación publicable para la ficha de un inmueble. */
export function toPublicDetailLocation<T extends LocatedListing>(listing: T): T {
  const v = listing.fcLocationVisibility ?? 1;
  return {
    ...listing,
    street: publicStreet(listing.street, v),
    ...blurred(
      listing.latitude,
      listing.longitude,
      DETAIL_OFFSET_METERS[v],
      String(listing.listingId),
    ),
  } as T;
}

/** Ubicación publicable para una tarjeta de resultados y su pin del mapa. */
export function toPublicCardLocation<T extends LocatedListing>(listing: T): T {
  const v = listing.fcLocationVisibility ?? 1;
  return {
    ...listing,
    street: publicStreet(listing.street, v),
    ...blurred(
      listing.latitude,
      listing.longitude,
      MAP_PIN_OFFSET_METERS[v] ?? MAP_PIN_OFFSET_METERS[2],
      String(listing.listingId),
    ),
  } as T;
}
