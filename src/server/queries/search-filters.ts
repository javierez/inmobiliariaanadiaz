import { sql, eq, inArray, type SQL } from "drizzle-orm";
import { listings, properties } from "~/server/db/schema";
import { selectionHasRooms } from "~/lib/property-rooms";
import { parseSubtypeKey } from "~/lib/search-utils";
import { RENT_LISTING_TYPES, SALE_LISTING_TYPES } from "~/lib/listing-types";

/**
 * The displayable surface, in SQL. Exported so result queries can also ORDER BY
 * it — the list must sort and filter on the number the card actually shows.
 * SQL twin of `resolveSquareMeter()` in ~/lib/surface; change both together.
 */
export const surfaceExpr = sql`CASE WHEN ${properties.propertyType} IN ('solar','terreno','parcela')
    THEN COALESCE(NULLIF(${properties.builtSurfaceArea}, 0), NULLIF(${properties.squareMeter}, 0))
    ELSE COALESCE(NULLIF(${properties.squareMeter}, 0), NULLIF(${properties.builtSurfaceArea}, 0))
  END`;

// Canonical SearchFilters type shared between result queries (listings.ts)
// and location-option queries (locations.ts) so they apply identical WHERE
// logic for everything except location itself.
export interface SearchFilters {
  // Legacy single-value location — used only when `cities` / `neighborhoodIds`
  // are absent (e.g. old bookmarked URLs).
  location?: string;
  // Multi-select city names (LIKE-matched per-city, OR'd together).
  cities?: string[];
  // Multi-select neighborhood IDs (serialized bigints).
  neighborhoodIds?: string[];
  // Province filter — canonical Spanish province name (e.g. "Zamora").
  // Resolved against DB variants in listings.ts before being applied.
  province?: string;
  // Single value (legacy) or array for multi-select
  propertyType?: string | string[];
  bedrooms?: number;
  bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  status?: "for-sale" | "for-rent";
  isOportunidad?: boolean;
  isBankOwned?: boolean;
  isFeatured?: boolean;
  hasPromotion?: boolean;
  promotionId?: bigint | string;
  // Extra boolean characteristic filters (AmenityKey[] from search-utils).
  amenities?: string[];
  // Subtipos, como claves `subtypeKey()` ("piso_atico"). Cada uno acota solo
  // su tipo (ver search-utils).
  subtypes?: string[];
  // Free-text query from the navbar "Busca" box. Matched against references,
  // address, location and title/description — see queries/text-search.ts.
  q?: string;
}

/**
 * `property_subtype` normalizado igual que `normalizeForUrl()` (~/lib/utils):
 * minúsculas, sin tildes, espacios → "-", fuera todo lo que no sea [a-z0-9-].
 * Es la clave con la que viaja un subtipo en la URL, así que "Ático" y el
 * "Atico" heredado caen en la misma opción. Cambia los dos a la vez.
 */
export const subtypeSlugSql = sql<string>`REGEXP_REPLACE(REGEXP_REPLACE(LOWER(unaccent(COALESCE(${properties.propertySubtype}, ''))), '[[:space:]]+', '-', 'g'), '[^a-z0-9-]', '', 'g')`;

/** Una nave guardada como local ("Local" + subtipo "Nave industrial"). */
export const naveStoredAsLocal = sql`(${properties.propertyType} = 'local' AND LOWER(COALESCE(${properties.propertySubtype}, '')) LIKE '%nave%')`;

// Maps each AmenityKey to the SQL condition that a listing must satisfy. Kept
// here (next to the schema columns) rather than in search-utils so the client
// bundle never imports the Drizzle schema.
const AMENITY_CONDITIONS: Record<string, SQL> = {
  ascensor: eq(properties.hasElevator, true),
  garaje: eq(properties.hasGarage, true),
  trastero: eq(properties.hasStorageRoom, true),
  terraza: eq(properties.terrace, true),
  piscina: sql`(${properties.pool} = true OR ${properties.communityPool} = true OR ${properties.privatePool} = true)`,
  jardin: eq(properties.garden, true),
  "aire-acondicionado": sql`(${properties.airConditioningType} IS NOT NULL AND ${properties.airConditioningType} <> '')`,
  calefaccion: eq(properties.hasHeating, true),
  "armarios-empotrados": eq(properties.builtInWardrobes, true),
  "cocina-amueblada": eq(properties.furnishedKitchen, true),
  exterior: eq(properties.exterior, true),
  luminoso: eq(properties.bright, true),
  "vistas-al-mar": eq(properties.seaViews, true),
  // La clave de URL se mantiene por SEO y por los enlaces ya publicados,
  // pero la condición real es obra nueva.
  "a-estrenar": eq(properties.newConstruction, true),
  accesible: eq(properties.disabledAccessible, true),
  alarma: eq(properties.alarm, true),
  "puerta-blindada": eq(properties.securityDoor, true),
  videoportero: eq(properties.videoIntercom, true),
  "zona-comunitaria": eq(properties.communityArea, true),
  jacuzzi: eq(properties.jacuzzi, true),
  // Acondicionamiento del local. Tri-estado: `false` y NULL quedan fuera.
  acondicionado: eq(properties.isFittedOut, true),
};

// Estado del inmueble → códigos de `properties.conservation_status`.
// El 5 es un "Reformado" heredado que aún vive en producción, así que la
// opción Reformado acepta 5 y 6. Los códigos 0/7/8 NO son estado: los escribió
// la migración de clickviviendas con la calificación energética, y filtrar por
// ellos afirmaría sobre el inmueble algo que sale de su certificado.
const CONSERVATION_CODES: Record<string, number[]> = {
  "estado-como-nuevo": [3],
  "estado-reformado": [5, 6],
  "estado-a-reformar": [4],
};

/**
 * Comprar / Alquilar → tipos de anuncio (ver ~/lib/listing-types). Compartido
 * con el rango de precios del buscador, que tiene que salir de los mismos
 * anuncios que luego filtra.
 */
export function listingTypeCondition(
  status?: "for-sale" | "for-rent",
): SQL | undefined {
  if (status === "for-rent") {
    return inArray(listings.listingType, [...RENT_LISTING_TYPES]);
  }
  if (status === "for-sale") {
    return inArray(listings.listingType, [...SALE_LISTING_TYPES]);
  }
  return undefined;
}

// Everything except location fields (cities / neighborhoodIds / location / province).
// Used by getProvinces / getCitiesAndNeighborhoodsByProvince so the dropdown
// only shows places that still have matching listings after other filters.
export type NonLocationFilters = Omit<
  SearchFilters,
  "cities" | "neighborhoodIds" | "location" | "province"
>;

export function buildNonLocationFilterConditions(
  filters?: NonLocationFilters,
): SQL[] {
  const conds: SQL[] = [];
  if (!filters) return conds;

  if (filters.propertyType) {
    const types = (
      Array.isArray(filters.propertyType)
        ? filters.propertyType
        : [filters.propertyType]
    ).filter((t): t is string => !!t && t !== "any");

    // "terreno-industrial" is a pseudo-type: industrial land is stored as a
    // Solar with an industrial subtype, not its own propertyType. Split it out
    // and OR its (type=solar AND subtype~industrial) clause with the rest.
    const hasTerrenoInd = types.includes("terreno-industrial");
    // "industrial" (Naves) is also mostly stored as a Local with a "Nave
    // industrial" subtype rather than a top-level propertyType, so the plain
    // eq(propertyType, 'industrial') matches almost nothing. Match both the
    // (rare) top-level 'industrial' AND the (type=local AND subtype~nave) rows.
    const hasIndustrial = types.includes("industrial");
    const realTypes = types.filter((t) => t !== "terreno-industrial");

    // "Local" sin las naves: tienen su propio tipo en el buscador ("Nave") y
    // la tarjeta las rotula "Nave industrial", así que listarlas también bajo
    // "Locales en venta" las contaba dos veces y contradecía la tarjeta.
    const hasLocal = realTypes.includes("local");

    // Subtipos elegidos, agrupados por su tipo. Acotan SOLO ese tipo.
    const subtypesByType = new Map<string, string[]>();
    for (const key of filters.subtypes ?? []) {
      const parsed = parseSubtypeKey(key);
      if (!parsed) continue;
      subtypesByType.set(parsed.type, [
        ...(subtypesByType.get(parsed.type) ?? []),
        parsed.slug,
      ]);
    }
    const refine = (type: string, cond: SQL): SQL => {
      const slugs = subtypesByType.get(type);
      return slugs && slugs.length > 0
        ? sql`(${cond} AND ${inArray(subtypeSlugSql, slugs)})`
        : cond;
    };

    const orParts: SQL[] = [];
    const wholeTypes = realTypes.filter(
      (t) => t !== "local" && !subtypesByType.has(t),
    );
    if (wholeTypes.length === 1) {
      orParts.push(eq(properties.propertyType, wholeTypes[0]!));
    } else if (wholeTypes.length > 1) {
      orParts.push(inArray(properties.propertyType, wholeTypes));
    }
    for (const t of realTypes) {
      if (t !== "local" && subtypesByType.has(t)) {
        orParts.push(refine(t, eq(properties.propertyType, t)));
      }
    }
    if (hasLocal) {
      orParts.push(
        refine(
          "local",
          sql`(${properties.propertyType} = 'local' AND NOT ${naveStoredAsLocal})`,
        ),
      );
    }
    if (hasTerrenoInd) {
      orParts.push(
        sql`(${properties.propertyType} = 'solar' AND LOWER(${properties.propertySubtype}) LIKE '%industrial%')`,
      );
    }
    if (hasIndustrial) {
      orParts.push(naveStoredAsLocal);
    }
    if (orParts.length === 1) {
      conds.push(orParts[0]!);
    } else if (orParts.length > 1) {
      conds.push(sql`(${sql.join(orParts, sql` OR `)})`);
    }
  }

  const operationCondition = listingTypeCondition(filters.status);
  if (operationCondition) conds.push(operationCondition);

  // Habitaciones/baños solo si alguno de los tipos elegidos los tiene. "Nave"
  // + "+2 habitaciones" (un enlace viejo, o elegido antes de cambiar el tipo)
  // devolvía cero resultados sin que nada lo explicara.
  const selectedTypes = filters.propertyType
    ? (Array.isArray(filters.propertyType)
        ? filters.propertyType
        : [filters.propertyType]
      ).filter((t) => !!t && t !== "any")
    : [];
  const roomsApply = selectionHasRooms(selectedTypes);

  if (roomsApply && filters.bedrooms && filters.bedrooms > 0) {
    conds.push(sql`${properties.bedrooms} >= ${filters.bedrooms}`);
  }

  if (roomsApply && filters.bathrooms && filters.bathrooms > 0) {
    conds.push(
      sql`CAST(${properties.bathrooms} AS DECIMAL) >= ${filters.bathrooms}`,
    );
  }

  if (filters.minPrice && filters.minPrice > 0) {
    conds.push(sql`CAST(${listings.price} AS DECIMAL) >= ${filters.minPrice}`);
  }

  if (filters.maxPrice && filters.maxPrice > 0) {
    conds.push(sql`CAST(${listings.price} AS DECIMAL) <= ${filters.maxPrice}`);
  }

  // Surface filter. MUST match `resolveSquareMeter()` in ~/lib/surface — the
  // list has to filter on the same number the card prints, or listings vanish
  // from results while still displaying a matching size.
  //
  // Before this, the filter compared `square_meter` raw. On land that column is
  // the BUILDABLE area and is absent on 1.470 of 2.591 solares, so `NULL >= X`
  // → NULL → the row was discarded: every one of them disappeared from any
  // search that used a surface filter. A stored 0 was dropped the same way.
  if (filters.minArea && filters.minArea > 0) {
    conds.push(sql`${surfaceExpr} >= ${filters.minArea}`);
  }

  if (filters.maxArea && filters.maxArea > 0) {
    conds.push(sql`${surfaceExpr} <= ${filters.maxArea}`);
  }

  if (filters.isOportunidad) {
    conds.push(eq(listings.isOpportunity, true));
  }

  if (filters.isBankOwned) {
    conds.push(eq(listings.isBankOwned, true));
  }

  if (filters.isFeatured) {
    conds.push(eq(listings.isFeatured, true));
  }

  if (filters.hasPromotion) {
    conds.push(sql`${listings.promotionId} IS NOT NULL`);
  }

  if (filters.promotionId !== undefined && filters.promotionId !== "") {
    const id =
      typeof filters.promotionId === "bigint"
        ? filters.promotionId
        : BigInt(filters.promotionId);
    conds.push(eq(listings.promotionId, id));
  }

  if (filters.amenities && filters.amenities.length > 0) {
    // Los estados de conservación se OR'ean entre sí (un inmueble tiene uno
    // solo: AND'earlos devolvería siempre cero). El resto se AND'ea.
    const codes = filters.amenities.flatMap((k) => CONSERVATION_CODES[k] ?? []);
    if (codes.length > 0) {
      conds.push(inArray(properties.conservationStatus, codes));
    }
    for (const key of filters.amenities) {
      const cond = AMENITY_CONDITIONS[key];
      if (cond) conds.push(cond);
    }
  }

  return conds;
}
