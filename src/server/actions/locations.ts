"use server";

import { db } from "~/server/db";
import { locations, listings, properties } from "~/server/db/schema";
import { sql, min, max, eq, and, inArray, type SQL } from "drizzle-orm";
import {
  toLocationKey,
  normalizeProvince,
  pickBestDisplayName,
  provinceSlug,
} from "~/lib/location-normalization";
import {
  hasAtLeastOnePhoto,
  visibleStatusCondition,
} from "~/server/queries/filters";
import { getPropertiesConfig } from "~/server/queries/website-config";
import {
  buildNonLocationFilterConditions,
  listingTypeCondition,
  type NonLocationFilters,
} from "~/server/queries/search-filters";
import { normalizeForUrl } from "~/lib/utils";
import { isRentalListingType, SALE_LISTING_TYPES } from "~/lib/listing-types";
import { isNave } from "~/lib/property-rooms";
import type { PropertyType, SubtypeOption } from "~/lib/search-utils";

/**
 * Condición de visibilidad por estado para las consultas de la web.
 *
 * La regla vive en `queries/filters.ts`; aquí solo se resuelve la ventana de la
 * cuenta. Antes esto era una copia que contaba desde `updatedAt`, así que una
 * edición cualquiera devolvía un vendido a los filtros de ciudad/barrio.
 * `getPropertiesConfig` va con `cache()`, así que las cuatro llamadas de este
 * fichero comparten una única lectura por petición.
 */
async function websiteVisibleStatus(): Promise<SQL> {
  const { soldVisibilityDays } = await getPropertiesConfig();
  return visibleStatusCondition(soldVisibilityDays);
}

export async function getActiveLocations(accountId: bigint) {
  try {
    // Get distinct neighborhood IDs from properties through listings for this account
    const activeNeighborhoodIds = await db
      .selectDistinct({ neighborhoodId: properties.neighborhoodId })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          sql`${properties.neighborhoodId} IS NOT NULL`,
          eq(listings.accountId, accountId),
          eq(listings.publishToWebsite, true),
          hasAtLeastOnePhoto(listings.propertyId),
        ),
      );

    if (activeNeighborhoodIds.length === 0) {
      return [];
    }

    // Get location details for active neighborhoods
    const locationData = await db
      .select({
        neighborhoodId: locations.neighborhoodId,
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        neighborhood: locations.neighborhood,
      })
      .from(locations)
      .where(
        sql`${locations.neighborhoodId} IN (${activeNeighborhoodIds
          .map((item) => item.neighborhoodId)
          .join(", ")}) AND ${locations.isActive} = true`,
      )
      .orderBy(locations.province, locations.city, locations.neighborhood);

    return locationData;
  } catch (error) {
    console.error("Error fetching active locations:", error);
    return [];
  }
}

export async function getAllLocations() {
  try {
    const locationData = await db
      .select({
        neighborhoodId: locations.neighborhoodId,
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        neighborhood: locations.neighborhood,
      })
      .from(locations)
      .where(sql`${locations.isActive} = true`)
      .orderBy(locations.province, locations.city, locations.neighborhood);

    return locationData;
  } catch (error) {
    console.error("Error fetching all locations:", error);
    return [];
  }
}

export async function getCities(accountId: bigint) {
  try {
    const cities = await db
      .selectDistinct({
        city: locations.city,
        province: locations.province,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .innerJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listings.accountId, accountId),
          eq(listings.isActive, true),
          eq(listings.publishToWebsite, true),
          eq(locations.isActive, true),
          await websiteVisibleStatus(),
          hasAtLeastOnePhoto(listings.propertyId),
        ),
      )
      .orderBy(locations.province, locations.city);

    return cities;
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export async function getNeighborhoodsByCity(city: string, accountId: bigint) {
  try {
    const neighborhoods = await db
      .selectDistinct({
        neighborhoodId: locations.neighborhoodId,
        city: locations.city,
        province: locations.province,
        municipality: locations.municipality,
        neighborhood: locations.neighborhood,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .innerJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(locations.city, city),
          eq(listings.accountId, accountId),
          eq(listings.isActive, true),
          eq(listings.publishToWebsite, true),
          eq(locations.isActive, true),
          await websiteVisibleStatus(),
          hasAtLeastOnePhoto(listings.propertyId),
        ),
      )
      .orderBy(locations.neighborhood);

    return neighborhoods;
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
    return [];
  }
}

export async function getProvinces(
  accountId: bigint,
  filters?: NonLocationFilters,
) {
  try {
    const extraConditions = buildNonLocationFilterConditions(filters);
    const rawProvinces = await db
      .selectDistinct({
        province: locations.province,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .innerJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          eq(listings.accountId, accountId),
          eq(listings.isActive, true),
          eq(listings.publishToWebsite, true),
          eq(locations.isActive, true),
          await websiteVisibleStatus(),
          hasAtLeastOnePhoto(listings.propertyId),
          ...extraConditions,
        ),
      );

    // Deduplicate variants ("LEON", "León", "Leon") into one canonical name
    const seen = new Map<string, string>();
    for (const row of rawProvinces) {
      if (!row.province) continue;
      const key = toLocationKey(row.province);
      if (!seen.has(key)) {
        seen.set(key, normalizeProvince(row.province));
      }
    }

    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b, "es"));
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
}

export async function getCitiesAndNeighborhoodsByProvince(
  province: string,
  accountId: bigint,
  filters?: NonLocationFilters,
) {
  try {
    // Por slug canónico, como el listado: la lista de provincias enseña el
    // nombre normalizado ("Vizcaya") y la BD puede guardar el alias ("Bizkaia").
    const provinceKey = provinceSlug(province);

    // Find all raw province variants that match this normalized key
    const allProvinces = await db
      .selectDistinct({ province: locations.province })
      .from(locations)
      .where(eq(locations.isActive, true));

    const matchingVariants = allProvinces
      .map((p) => p.province)
      .filter((p) => provinceSlug(p) === provinceKey);

    if (matchingVariants.length === 0) return [];

    const extraConditions = buildNonLocationFilterConditions(filters);

    // Query using all matching province variants
    const data = await db
      .selectDistinct({
        neighborhoodId: locations.neighborhoodId,
        city: locations.city,
        neighborhood: locations.neighborhood,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .innerJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .where(
        and(
          inArray(locations.province, matchingVariants),
          eq(listings.accountId, accountId),
          eq(listings.isActive, true),
          eq(listings.publishToWebsite, true),
          eq(locations.isActive, true),
          await websiteVisibleStatus(),
          hasAtLeastOnePhoto(listings.propertyId),
          ...extraConditions,
        ),
      )
      .orderBy(locations.city, locations.neighborhood);

    // Group by normalized city key, merging variants
    const cityMap = new Map<
      string,
      {
        cityVariants: string[];
        neighborhoods: Map<
          string,
          { neighborhoodId: bigint; variants: string[] }
        >;
      }
    >();

    for (const row of data) {
      const cityKey = toLocationKey(row.city);
      const hoodKey = toLocationKey(row.neighborhood);

      let cityGroup = cityMap.get(cityKey);
      if (!cityGroup) {
        cityGroup = { cityVariants: [], neighborhoods: new Map() };
        cityMap.set(cityKey, cityGroup);
      }

      if (!cityGroup.cityVariants.includes(row.city)) {
        cityGroup.cityVariants.push(row.city);
      }

      let hoodGroup = cityGroup.neighborhoods.get(hoodKey);
      if (!hoodGroup) {
        hoodGroup = { neighborhoodId: row.neighborhoodId, variants: [] };
        cityGroup.neighborhoods.set(hoodKey, hoodGroup);
      }

      if (!hoodGroup.variants.includes(row.neighborhood)) {
        hoodGroup.variants.push(row.neighborhood);
      }
    }

    // Build result with best display names, sorted
    return Array.from(cityMap.entries())
      .map(([, group]) => ({
        city: pickBestDisplayName(group.cityVariants),
        neighborhoods: Array.from(group.neighborhoods.values()).map((hood) => ({
          neighborhoodId: hood.neighborhoodId,
          neighborhood: pickBestDisplayName(hood.variants),
        })),
      }))
      .sort((a, b) => a.city.localeCompare(b.city, "es"));
  } catch (error) {
    console.error(
      "Error fetching cities and neighborhoods by province:",
      error,
    );
    return [];
  }
}

export async function getPropertyTypes(accountId: bigint) {
  try {
    const propertyTypes = await db
      .selectDistinct({ propertyType: properties.propertyType })
      .from(properties)
      .where(
        and(
          eq(properties.accountId, accountId),
          eq(properties.isActive, true),
          hasAtLeastOnePhoto(properties.propertyId),
        ),
      )
      .orderBy(properties.propertyType);

    return propertyTypes.map((p) => p.propertyType).filter(Boolean);
  } catch (error) {
    console.error("Error fetching property types:", error);
    return [];
  }
}

// Subtipos que no describen nada que un visitante busque: el cajón "Otros" y
// los códigos de capacidad de garaje de Idealista ("car_compact").
const NON_SEARCHABLE_SUBTYPES = new Set(["otros", "unknown", "individual"]);

/**
 * Subtipos que la web tiene publicados, para el filtro "Subtipo" del buscador.
 * Salen de los datos (no de una lista fija) para no ofrecer opciones que
 * devuelvan cero, con las mismas puertas que el resto de desplegables.
 *
 * Las naves guardadas como local no se ofrecen como subtipo de "Local": el
 * buscador ya las tiene como tipo propio ("Nave") y "Local" las excluye.
 */
export async function getSubtypeOptions(
  accountId: bigint,
): Promise<SubtypeOption[]> {
  try {
    const rows = await db
      .select({
        propertyType: properties.propertyType,
        propertySubtype: properties.propertySubtype,
        listingType: listings.listingType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(listings)
      .innerJoin(properties, eq(listings.propertyId, properties.propertyId))
      .where(
        and(
          eq(listings.accountId, accountId),
          eq(listings.isActive, true),
          eq(listings.publishToWebsite, true),
          await websiteVisibleStatus(),
          hasAtLeastOnePhoto(listings.propertyId),
          sql`${properties.propertySubtype} IS NOT NULL`,
          sql`${properties.propertyType} <> 'garaje'`,
        ),
      )
      .groupBy(
        properties.propertyType,
        properties.propertySubtype,
        listings.listingType,
      );

    // Agrupa variantes ("Ático" / "Atico") por (tipo, slug).
    const groups = new Map<
      string,
      {
        type: string;
        slug: string;
        variants: string[];
        count: number;
        operations: Set<"for-sale" | "for-rent">;
      }
    >();
    for (const row of rows) {
      const raw = row.propertySubtype?.trim() ?? "";
      const type = row.propertyType?.toLowerCase() ?? "";
      // Códigos de Idealista ("car_compact"): el "_" se mira antes de
      // normalizar, que lo borra.
      if (!type || !raw || raw.includes("_")) continue;
      const slug = normalizeForUrl(raw);
      if (!slug || NON_SEARCHABLE_SUBTYPES.has(slug)) continue;
      if (isNave(type, raw)) continue;
      const key = `${type}|${slug}`;
      const group = groups.get(key) ?? {
        type,
        slug,
        variants: [],
        count: 0,
        operations: new Set(),
      };
      if (!group.variants.includes(raw)) group.variants.push(raw);
      group.count += row.count;
      if (isRentalListingType(row.listingType)) group.operations.add("for-rent");
      else if (
        (SALE_LISTING_TYPES as readonly string[]).includes(row.listingType)
      ) {
        group.operations.add("for-sale");
      }
      groups.set(key, group);
    }

    return Array.from(groups.values())
      .filter((g) => g.operations.size > 0)
      .sort((a, b) => b.count - a.count)
      .map((g) => ({
        type: g.type as Exclude<PropertyType, "any">,
        slug: g.slug,
        label: pickBestDisplayName(g.variants),
        operations: Array.from(g.operations),
      }));
  } catch (error) {
    console.error("Error fetching subtype options:", error);
    return [];
  }
}

export interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

/**
 * Precio mínimo y máximo de lo que la web enseña, por operación: el deslizador
 * de venta no puede ir de 450 € a 2 M€ porque haya alquileres.
 *
 * `min()`/`max()` sobre un `decimal` devuelven texto; antes se devolvía tal
 * cual y el `typeof === "number"` del llamador siempre fallaba, así que el
 * deslizador era 0 – 2.000.000 € en todas las webs.
 */
export async function getPriceRange(
  accountId: bigint,
  status?: "for-sale" | "for-rent",
): Promise<PriceRange> {
  const fallback = { minPrice: 0, maxPrice: 2000000 };
  try {
    const operation = listingTypeCondition(status);
    const [row] = await db
      .select({
        minPrice: min(listings.price),
        maxPrice: max(listings.price),
      })
      .from(listings)
      .where(
        and(
          eq(listings.accountId, accountId),
          eq(listings.isActive, true),
          eq(listings.publishToWebsite, true),
          await websiteVisibleStatus(),
          hasAtLeastOnePhoto(listings.propertyId),
          sql`CAST(${listings.price} AS DECIMAL) > 0`,
          ...(operation ? [operation] : []),
        ),
      );

    const minPrice = Number(row?.minPrice);
    const maxPrice = Number(row?.maxPrice);
    if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice)) {
      return fallback;
    }
    return { minPrice: Math.floor(minPrice), maxPrice: Math.ceil(maxPrice) };
  } catch (error) {
    console.error("Error fetching price range:", error);
    return fallback;
  }
}
