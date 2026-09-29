import { normalizeForUrl } from "./utils";
import { normalizeProvince } from "./location-normalization";

export type PropertyType =
  | "piso"
  | "casa"
  | "local"
  | "solar"
  | "garaje"
  | "edificio"
  | "oficina"
  | "industrial"
  | "trastero"
  // Pseudo-type: not a real top-level propertyType. It resolves to Solar
  // listings whose subtype is industrial land ("Suelo industrial"). See the
  // special-case in server/queries/search-filters.ts.
  | "terreno-industrial"
  | "any";

// Canonical singular labels for the search UI (dropdown + footer). Single source
// of truth — "industrial" is a nave, and "terreno-industrial" is industrial land.
export const PROPERTY_TYPE_LABEL: Record<
  Exclude<PropertyType, "any">,
  string
> = {
  piso: "Piso",
  casa: "Casa",
  local: "Local",
  solar: "Terreno",
  garaje: "Garaje",
  edificio: "Edificio",
  oficina: "Oficina",
  industrial: "Nave",
  trastero: "Trastero",
  "terreno-industrial": "Terreno industrial",
};

// Tipos que ofrece el buscador, en este orden. Una sola lista para el
// formulario de la home y la barra de resultados: la home ofrecía 6 tipos (sin
// oficina, edificio ni trastero) y la barra de resultados 9, así que una oficina
// solo se podía buscar desde la segunda. Account 137 (agencia de industrial)
// añade el pseudo-tipo "terreno-industrial".
const BASE_SEARCH_TYPES: Exclude<PropertyType, "any">[] = [
  "piso",
  "casa",
  "local",
  "solar",
  "garaje",
  "edificio",
  "oficina",
  "industrial",
  "trastero",
];

/** ¿Tiene este tipo página de búsqueda propia (slug)? */
export function isSearchPropertyType(
  type: string,
): type is Exclude<PropertyType, "any"> {
  return (BASE_SEARCH_TYPES as string[]).includes(type);
}

export function getSearchPropertyTypes(
  includeTerrenoIndustrial: boolean,
): Exclude<PropertyType, "any">[] {
  if (!includeTerrenoIndustrial) return BASE_SEARCH_TYPES;
  const out = [...BASE_SEARCH_TYPES];
  out.splice(out.indexOf("industrial") + 1, 0, "terreno-industrial");
  return out;
}

/**
 * Subtipo elegible en el buscador. `slug` es el subtipo normalizado igual en
 * la URL y en la query (ver `subtypeSlugSql` en
 * server/queries/search-filters.ts), así que "Ático" y el "Atico" heredado son
 * la misma opción.
 *
 * El subtipo viaja CON su tipo (`subtipo-piso_atico`): acota solo a su tipo.
 * "Piso › Ático" + "Casa" son los áticos y todas las casas, no "áticos que
 * además sean casa".
 */
export interface SubtypeOption {
  type: Exclude<PropertyType, "any">;
  slug: string;
  label: string;
  /** Operaciones en las que hay alguno publicado (no ofrecer lo que da cero). */
  operations: ("for-sale" | "for-rent")[];
}

/** Los subtipos que tienen algo publicado en la operación elegida. */
export function subtypeOptionsFor(
  options: SubtypeOption[],
  status: "for-sale" | "for-rent" | "any",
): SubtypeOption[] {
  return status === "any"
    ? options
    : options.filter((o) => o.operations.includes(status));
}

const SUBTYPE_TOKEN_PREFIX = "subtipo-";

/**
 * Mínimos de habitaciones y baños que ofrecen los buscadores: los que la URL
 * sabe decir ("cuatro-o-mas-dormitorios", "tres-o-mas-banos"). Se ofrecían +5
 * habitaciones y +4 baños, y volvían de la URL como +4 y +3.
 */
export const MIN_BEDROOM_OPTIONS = ["1", "2", "3", "4"] as const;
export const MIN_BATHROOM_OPTIONS = ["1", "2", "3"] as const;

// Mismo texto que el segmento de categoría de siempre (`/…/oportunidad`).
const CATEGORY_TOKENS = {
  isOportunidad: "oportunidad",
  isBankOwned: "origen-bancario",
  isFeatured: "destacados",
} as const;

/**
 * Quita los subtipos cuyo tipo ya no está elegido. Sin esto, desmarcar "Piso"
 * dejaba "Ático" en la URL acotando nada, y al volver a marcar Piso reaparecía.
 */
export function pruneSubtypes(
  subtypes: readonly string[],
  types: readonly string[],
): string[] {
  return subtypes.filter((key) => {
    const parsed = parseSubtypeKey(key);
    return parsed !== null && types.includes(parsed.type);
  });
}

/** Clave de un subtipo elegido: "piso_atico". */
export function subtypeKey(type: string, slug: string): string {
  return `${type}_${slug}`;
}

/** "piso_atico" → { type: "piso", slug: "atico" }; null si no tiene forma. */
export function parseSubtypeKey(
  key: string,
): { type: string; slug: string } | null {
  const i = key.indexOf("_");
  if (i <= 0 || i === key.length - 1) return null;
  const type = normalizeForUrl(key.slice(0, i));
  const slug = normalizeForUrl(key.slice(i + 1));
  return type && slug ? { type, slug } : null;
}

// Extra boolean "characteristics" filters: the "Características" panel of both
// search forms (home and results bar). Single source of truth shared by the
// UI (labels), the slug encoder/decoder (slug token == key) and the server
// query (key → SQL condition in search-filters.ts).
export const AMENITY_FILTERS = [
  { key: "ascensor", label: "Ascensor" },
  { key: "garaje", label: "Garaje" },
  { key: "trastero", label: "Trastero" },
  { key: "terraza", label: "Terraza" },
  { key: "piscina", label: "Piscina" },
  { key: "jardin", label: "Jardín" },
  { key: "aire-acondicionado", label: "Aire acondicionado" },
  { key: "calefaccion", label: "Calefacción" },
  { key: "armarios-empotrados", label: "Armarios empotrados" },
  { key: "cocina-amueblada", label: "Cocina amueblada" },
  { key: "exterior", label: "Exterior" },
  { key: "luminoso", label: "Luminoso" },
  { key: "vistas-al-mar", label: "Vistas al mar" },
  { key: "a-estrenar", label: "A estrenar" },
  { key: "accesible", label: "Accesible" },
  { key: "alarma", label: "Alarma" },
  { key: "puerta-blindada", label: "Puerta blindada" },
  { key: "videoportero", label: "Videoportero" },
  { key: "zona-comunitaria", label: "Zona comunitaria" },
  { key: "jacuzzi", label: "Jacuzzi" },
  // Estado del inmueble. Leen `properties.conservation_status` (fuente única);
  // los tres se OR'ean entre sí en la query — marcar dos es "cualquiera de los
  // dos", no la intersección imposible. Ojo: "a-estrenar" (arriba) NO es un
  // estado, consulta obra nueva y se mantiene por los enlaces ya publicados.
  { key: "estado-como-nuevo", label: "Como nuevo" },
  { key: "estado-reformado", label: "Reformado" },
  { key: "estado-a-reformar", label: "A reformar" },
  // Acondicionamiento del local (`properties.is_fitted_out`). Tri-estado:
  // sólo el afirmativo — NULL es "no consta" y no debe salir en el filtro.
  { key: "acondicionado", label: "Acondicionado" },
] as const;

export type AmenityKey = (typeof AMENITY_FILTERS)[number]["key"];

// Las cuatro últimas describen el ESTADO del inmueble, no un equipamiento, y
// el formulario las pinta en su propio bloque bajo un separador. Viven en la
// misma lista para no duplicar el encoder de slug ni la query.
const CONDITION_KEYS = new Set<string>([
  "estado-como-nuevo",
  "estado-reformado",
  "estado-a-reformar",
  "acondicionado",
]);

export const EQUIPMENT_FILTERS = AMENITY_FILTERS.filter(
  (a) => !CONDITION_KEYS.has(a.key),
);
export const CONDITION_FILTERS = AMENITY_FILTERS.filter((a) =>
  CONDITION_KEYS.has(a.key),
);

const AMENITY_KEYS = new Set<string>(AMENITY_FILTERS.map((a) => a.key));

export interface SearchParams {
  // Legacy single-value location (still populated by the parser for existing
  // consumers like page title rendering). New code should read `cities`.
  location?: string;
  // Multi-select city names (kebab/space tolerant — each element is stored as
  // a decoded human string like "Málaga" or "Nueva Andalucía").
  cities?: string[];
  // Multi-select neighborhood IDs (bigint IDs serialized as strings).
  neighborhoodIds?: string[];
  // Accepts a single value (legacy) or an array for multi-select.
  propertyType?: PropertyType | PropertyType[];
  bedrooms?: string;
  bathrooms?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  status?: "for-sale" | "for-rent" | "any";
  province?: string;
  municipality?: string;
  isOportunidad?: boolean;
  isBankOwned?: boolean;
  isFeatured?: boolean;
  // Extra boolean characteristic filters (see AMENITY_FILTERS). Each element is
  // an AmenityKey; all selected amenities are AND'd in the query.
  amenities?: string[];
  // Subtipos elegidos, como claves `subtypeKey()` ("piso_atico"). Cada uno
  // acota solo su tipo; dentro de un tipo, OR ("Ático o Dúplex").
  subtypes?: string[];
}

// Normalize propertyType input to a deduped array of concrete types
// (drops "any" and undefined). Returns [] when the filter is "any".
export function normalizePropertyTypes(
  input: SearchParams["propertyType"],
): Exclude<PropertyType, "any">[] {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : [input];
  const out = arr.filter(
    (t): t is Exclude<PropertyType, "any"> => !!t && t !== "any",
  );
  return Array.from(new Set(out));
}

// Convert search params to URL slug
export function buildSearchSlug(params: SearchParams): string {
  const segments: string[] = [];

  // Add property type and status
  let typeSegment = "";
  if (params.status === "for-rent") {
    typeSegment = "alquiler";
  } else if (params.status === "any") {
    // Neutral "all statuses" entry point. Used by the navbar free-text search,
    // which must find a reference whether it's a sale or a rental. Without this
    // "any" silently collapsed into "venta" and hid every rental.
    typeSegment = "todo";
  } else {
    typeSegment = "venta";
  }

  const typeToSlug: Record<Exclude<PropertyType, "any">, string> = {
    casa: "-casas",
    piso: "-pisos",
    local: "-locales",
    solar: "-solares",
    garaje: "-garajes",
    edificio: "-edificios",
    oficina: "-oficinas",
    industrial: "-naves-industriales",
    trastero: "-trasteros",
    "terreno-industrial": "-terrenos-industriales",
  };

  const types = normalizePropertyTypes(params.propertyType);
  if (types.length > 0) {
    // Sort by type key for a canonical URL regardless of selection order
    const sorted = [...types].sort();
    for (const t of sorted) {
      typeSegment += typeToSlug[t];
    }
  } else {
    typeSegment += "-propiedades";
  }

  segments.push(typeSegment);

  // Add location (cities) — multi-select capable
  const citiesList =
    params.cities && params.cities.length > 0
      ? params.cities
      : params.location
        ? [params.location]
        : [];
  if (citiesList.length > 0) {
    const citySlugs = citiesList.map((c) => normalizeForUrl(c)).filter(Boolean);
    // Sort for a canonical URL regardless of click order.
    const canonical = Array.from(new Set(citySlugs)).sort().join(",");
    segments.push(`en-${canonical}`);
  } else {
    segments.push("todas-ubicaciones");
  }

  // Add neighborhood IDs as a dedicated segment
  if (params.neighborhoodIds && params.neighborhoodIds.length > 0) {
    const canonicalIds = Array.from(new Set(params.neighborhoodIds))
      .filter(Boolean)
      .sort();
    if (canonicalIds.length > 0) {
      segments.push(`barrios-${canonicalIds.join(",")}`);
    }
  }

  // Add province and municipality
  if (params.province && params.province !== "all") {
    segments.push(`provincia-${normalizeForUrl(params.province)}`);
  }
  if (params.municipality && params.municipality !== "all") {
    segments.push(`municipio-${params.municipality}`);
  }

  // Add filters
  const filters: string[] = [];

  if (params.minPrice) {
    filters.push(`precio-desde_${params.minPrice}`);
  }

  if (params.maxPrice) {
    filters.push(`precio-hasta_${params.maxPrice}`);
  }

  if (params.minArea) {
    filters.push(`metros-cuadrados-mas-de_${params.minArea}`);
  }

  if (params.maxArea) {
    filters.push(`metros-cuadrados-menos-de_${params.maxArea}`);
  }

  if (params.bedrooms && params.bedrooms !== "any") {
    const bedroomsNum = Number.parseInt(params.bedrooms);
    if (bedroomsNum === 1) {
      filters.push("un-dormitorio");
    } else if (bedroomsNum === 2) {
      filters.push("dos-dormitorios");
    } else if (bedroomsNum === 3) {
      filters.push("tres-dormitorios");
    } else if (bedroomsNum >= 4) {
      filters.push("cuatro-o-mas-dormitorios");
    }
  }

  if (params.bathrooms && params.bathrooms !== "any") {
    const bathroomsNum = Number.parseInt(params.bathrooms);
    if (bathroomsNum === 1) {
      filters.push("un-bano");
    } else if (bathroomsNum === 2) {
      filters.push("dos-banos");
    } else if (bathroomsNum >= 3) {
      filters.push("tres-o-mas-banos");
    }
  }

  // Extra characteristic filters (ascensor, garaje, ...) — the amenity key
  // doubles as the URL token.
  if (params.amenities && params.amenities.length > 0) {
    const canonical = Array.from(new Set(params.amenities))
      .filter((a) => AMENITY_KEYS.has(a))
      .sort();
    for (const a of canonical) {
      filters.push(a);
    }
  }

  // Categorías de la home (Oportunidad, Origen bancario, Destacados). Entran
  // por /venta-propiedades/oportunidad, pero al refinar desde la barra de
  // resultados la ciudad ocupa ese segmento y la categoría se perdía: viajan
  // también aquí, junto al resto de filtros.
  if (params.isOportunidad) filters.push(CATEGORY_TOKENS.isOportunidad);
  if (params.isBankOwned) filters.push(CATEGORY_TOKENS.isBankOwned);
  if (params.isFeatured) filters.push(CATEGORY_TOKENS.isFeatured);

  if (params.subtypes && params.subtypes.length > 0) {
    const canonical = Array.from(new Set(params.subtypes))
      .map(parseSubtypeKey)
      .filter((k): k is { type: string; slug: string } => k !== null)
      .map((k) => subtypeKey(k.type, k.slug))
      .sort();
    for (const key of new Set(canonical)) {
      filters.push(`${SUBTYPE_TOKEN_PREFIX}${key}`);
    }
  }

  // Add filters to URL if any exist
  if (filters.length > 0) {
    segments.push(`con-${filters.join(",")}`);
  }

  return segments.join("/");
}

/**
 * Decode one path segment before splitting it on `,`.
 *
 * Next hands `params.slug` percent-encoded, so a multi-value segment arrives as
 * `astorga%2Cleon` and `split(",")` returns ONE element. The city and barrios
 * branches already did this inline; the `con-…` filters branch did not, so
 * `con-precio-desde_100000,precio-hasta_150000` parsed as a single filter and
 * only the first one ever reached the query — "hasta 150.000 €" was returning
 * properties of 3.300.000 € on ecogar.es (reported 1-sep-2026).
 */
function decodeSlugSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Parse URL slug to search params
export function parseSearchSlug(slug: string): SearchParams {
  const params: SearchParams = {};

  // Split the slug into segments
  const segments = slug.split("/").filter(Boolean);

  // Parse property type and status
  if (segments.length > 0) {
    const typeSegment = segments[0] ?? "";

    // "alquil" cubre "alquiler-…" y el "/alquilar" que enlazaba el pie.
    if (typeSegment.startsWith("alquil")) {
      params.status = "for-rent";
    } else if (typeSegment.startsWith("todo")) {
      // "todo" / "todo-pisos" → every listing type. See buildSearchSlug.
      params.status = "any";
    } else {
      params.status = "for-sale";
    }

    const slugToType: Record<string, Exclude<PropertyType, "any">> = {
      "-casas": "casa",
      "-pisos": "piso",
      "-locales": "local",
      "-solares": "solar",
      "-garajes": "garaje",
      "-edificios": "edificio",
      "-oficinas": "oficina",
      "-naves-industriales": "industrial",
      "-trasteros": "trastero",
      "-terrenos-industriales": "terreno-industrial",
    };

    const matched: Exclude<PropertyType, "any">[] = [];
    let remaining = typeSegment;
    // Match longest slugs first so "-naves-industriales" doesn't get partially
    // shadowed if we later add overlapping keys.
    const orderedSlugs = Object.keys(slugToType).sort(
      (a, b) => b.length - a.length,
    );
    for (const slug of orderedSlugs) {
      if (remaining.includes(slug)) {
        const type = slugToType[slug]!;
        matched.push(type);
        remaining = remaining.split(slug).join("");
      }
    }
    if (matched.length > 0) {
      params.propertyType = matched;
    }
  }

  // Parse location (cities) — supports single legacy value or comma-separated list
  if (segments.length > 1 && segments[1] !== "todas-ubicaciones") {
    let locationSegment = segments[1] ?? "";
    // Remove 'en-' prefix if it exists
    if (locationSegment.startsWith("en-")) {
      locationSegment = locationSegment.substring(3);
    }
    // Check for special category filters (no location involved).
    if (locationSegment === "oportunidad") {
      params.isOportunidad = true;
    } else if (locationSegment === "origen-bancario") {
      params.isBankOwned = true;
    } else if (locationSegment === "destacados") {
      params.isFeatured = true;
    } else {
      // Decode percent-encoding FIRST so commas (encoded as %2C by some
      // routers) become literal `,` before we split. Otherwise the whole
      // list collapses into a single element ("astorga%2Cleon").
      const citySlugs = decodeSlugSegment(locationSegment)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const cityNames = citySlugs.map((slug) => slug.replace(/-/g, " "));
      if (cityNames.length > 0) {
        params.cities = cityNames;
        // Keep legacy single-value `location` populated with the first city so
        // existing consumers (page title, breadcrumb) keep working.
        params.location = cityNames[0];
      }
    }
  }

  // Parse province, municipality, and neighborhood IDs
  for (let i = 2; i < segments.length; i++) {
    const segment = segments[i];
    if (segment?.startsWith("provincia-")) {
      // El slug lleva guiones donde el nombre lleva espacios: sin deshacerlos,
      // "provincia-ciudad-real" daba "Ciudad-real" y no casaba con nada.
      params.province = normalizeProvince(
        segment.substring(10).replace(/-/g, " "),
      );
    } else if (segment?.startsWith("municipio-")) {
      params.municipality = segment.substring(10);
    } else if (segment?.startsWith("barrios-")) {
      const ids = decodeSlugSegment(segment.substring("barrios-".length))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length > 0) {
        params.neighborhoodIds = ids;
      }
    }
  }

  // Parse filters
  const filtersSegment = segments.find((segment) =>
    segment?.startsWith("con-"),
  );
  if (filtersSegment) {
    const filtersString = decodeSlugSegment(filtersSegment).substring(4); // Remove 'con-'
    const filters = filtersString.split(",");

    filters.forEach((filter) => {
      if (filter.startsWith("precio-desde_")) {
        params.minPrice = Number.parseInt(filter.split("_")[1] ?? "0");
      } else if (filter.startsWith("precio-hasta_")) {
        params.maxPrice = Number.parseInt(filter.split("_")[1] ?? "0");
      } else if (filter.startsWith("metros-cuadrados-mas-de_")) {
        params.minArea = Number.parseInt(filter.split("_")[1] ?? "0");
      } else if (filter.startsWith("metros-cuadrados-menos-de_")) {
        params.maxArea = Number.parseInt(filter.split("_")[1] ?? "0");
      } else if (filter === "un-dormitorio") {
        params.bedrooms = "1";
      } else if (filter === "dos-dormitorios") {
        params.bedrooms = "2";
      } else if (filter === "tres-dormitorios") {
        params.bedrooms = "3";
      } else if (filter === "cuatro-o-mas-dormitorios") {
        params.bedrooms = "4";
      } else if (filter === "un-bano") {
        params.bathrooms = "1";
      } else if (filter === "dos-banos") {
        params.bathrooms = "2";
      } else if (filter === "tres-o-mas-banos") {
        params.bathrooms = "3";
      } else if (AMENITY_KEYS.has(filter)) {
        (params.amenities ??= []).push(filter);
      } else if (filter === CATEGORY_TOKENS.isOportunidad) {
        params.isOportunidad = true;
      } else if (filter === CATEGORY_TOKENS.isBankOwned) {
        params.isBankOwned = true;
      } else if (filter === CATEGORY_TOKENS.isFeatured) {
        params.isFeatured = true;
      } else if (filter.startsWith(SUBTYPE_TOKEN_PREFIX)) {
        const parsed = parseSubtypeKey(
          filter.slice(SUBTYPE_TOKEN_PREFIX.length),
        );
        if (parsed) {
          (params.subtypes ??= []).push(subtypeKey(parsed.type, parsed.slug));
        }
      }
    });
  }

  return params;
}
