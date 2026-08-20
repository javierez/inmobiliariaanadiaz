import { sql, eq, inArray, type SQL } from "drizzle-orm";
import { listings, properties } from "~/server/db/schema";

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
  // Free-text query from the navbar "Busca" box. Matched against references,
  // address, location and title/description — see queries/text-search.ts.
  q?: string;
}

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
  "a-estrenar": eq(properties.brandNew, true),
  accesible: eq(properties.disabledAccessible, true),
  alarma: eq(properties.alarm, true),
  "puerta-blindada": eq(properties.securityDoor, true),
  videoportero: eq(properties.videoIntercom, true),
  "zona-comunitaria": eq(properties.communityArea, true),
  jacuzzi: eq(properties.jacuzzi, true),
};

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

    const orParts: SQL[] = [];
    if (realTypes.length === 1) {
      orParts.push(eq(properties.propertyType, realTypes[0]!));
    } else if (realTypes.length > 1) {
      orParts.push(inArray(properties.propertyType, realTypes));
    }
    if (hasTerrenoInd) {
      orParts.push(
        sql`(${properties.propertyType} = 'solar' AND LOWER(${properties.propertySubtype}) LIKE '%industrial%')`,
      );
    }
    if (hasIndustrial) {
      orParts.push(
        sql`(${properties.propertyType} = 'local' AND LOWER(${properties.propertySubtype}) LIKE '%nave%')`,
      );
    }
    if (orParts.length === 1) {
      conds.push(orParts[0]!);
    } else if (orParts.length > 1) {
      conds.push(sql`(${sql.join(orParts, sql` OR `)})`);
    }
  }

  if (filters.status === "for-rent") {
    conds.push(sql`${listings.listingType} IN ('Rent', 'RentWithOption')`);
  } else if (filters.status === "for-sale") {
    conds.push(eq(listings.listingType, "Sale"));
  }

  if (filters.bedrooms && filters.bedrooms > 0) {
    conds.push(sql`${properties.bedrooms} >= ${filters.bedrooms}`);
  }

  if (filters.bathrooms && filters.bathrooms > 0) {
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
    for (const key of filters.amenities) {
      const cond = AMENITY_CONDITIONS[key];
      if (cond) conds.push(cond);
    }
  }

  return conds;
}
