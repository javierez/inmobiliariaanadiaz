"use server";

import { db } from "~/server/db";
import { locations, listings, properties } from "~/server/db/schema";
import { sql, min, max, eq, and, inArray, type SQL } from "drizzle-orm";
import {
  toLocationKey,
  normalizeProvince,
  pickBestDisplayName,
} from "~/lib/location-normalization";
import {
  hasAtLeastOnePhoto,
  visibleStatusCondition,
} from "~/server/queries/filters";
import { getPropertiesConfig } from "~/server/queries/website-config";
import {
  buildNonLocationFilterConditions,
  type NonLocationFilters,
} from "~/server/queries/search-filters";

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
    const provinceKey = toLocationKey(province);

    // Find all raw province variants that match this normalized key
    const allProvinces = await db
      .selectDistinct({ province: locations.province })
      .from(locations)
      .where(eq(locations.isActive, true));

    const matchingVariants = allProvinces
      .map((p) => p.province)
      .filter((p) => toLocationKey(p) === provinceKey);

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

export async function getPriceRange(accountId: bigint) {
  try {
    const priceRange = await db
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
          hasAtLeastOnePhoto(listings.propertyId),
        ),
      );

    return priceRange[0] || { minPrice: 0, maxPrice: 2000000 };
  } catch (error) {
    console.error("Error fetching price range:", error);
    return { minPrice: 0, maxPrice: 2000000 };
  }
}
