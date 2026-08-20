"use server";

import { resolveSquareMeter } from "~/lib/surface";
import { db } from "../db";
import {
  properties,
  listings,
  locations,
  propertyImages,
} from "~/server/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { cache } from "react";
import { env } from "~/env";
import type { PropertyType, Property } from "~/lib/data";
import { hasAtLeastOnePhoto } from "./filters";

const ACCOUNT_ID = 137n;

export const getPropertiesProps = cache(async () => {
  try {
    // Query properties with their listings and first image
    const propertiesData = await db
      .select({
        // Property fields
        propertyId: properties.propertyId,
        referenceNumber: properties.referenceNumber,
        // Listing's publishableTitle overrides property title when set.
        title: sql<
          string | null
        >`COALESCE(${listings.publishableTitle}, ${properties.title})`,
        propertyType: properties.propertyType,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        squareMeter: properties.squareMeter,
        builtSurfaceArea: properties.builtSurfaceArea,

        // Listing fields
        listingId: listings.listingId,
        price: listings.price,
        listingType: listings.listingType,
        status: listings.status,
        isFeatured: listings.isFeatured,

        // Location fields
        city: locations.city,
        province: locations.province,
        neighborhood: locations.neighborhood,

        // First image
        imageUrl: propertyImages.imageUrl,
      })
      .from(properties)
      .innerJoin(
        listings,
        and(
          eq(listings.propertyId, properties.propertyId),
          eq(listings.accountId, ACCOUNT_ID),
          eq(listings.isActive, true),
        ),
      )
      .leftJoin(
        locations,
        eq(properties.neighborhoodId, locations.neighborhoodId),
      )
      .leftJoin(
        propertyImages,
        and(
          eq(propertyImages.propertyId, properties.propertyId),
          eq(propertyImages.isActive, true),
          eq(propertyImages.imageOrder, 0),
          sql`(${propertyImages.imageTag} IS NULL OR ${propertyImages.imageTag} NOT IN ('tour', 'youtube', 'video'))`,
        ),
      )
      .where(
        and(
          eq(properties.accountId, ACCOUNT_ID),
          eq(properties.isActive, true),
          eq(listings.status, "En Venta"),
          eq(listings.publishToWebsite, true),
          hasAtLeastOnePhoto(properties.propertyId),
        ),
      )
      .orderBy(desc(listings.isFeatured), desc(listings.createdAt))
      .limit(12);

    // Transform the data to match the expected Property type
    const formattedProperties: Property[] = propertiesData.map((property) => ({
      id: property.propertyId?.toString() || "",
      reference: property.referenceNumber || "",
      listingId: property.listingId?.toString() || "",
      title:
        property.title ??
        `${property.propertyType} en ${property.neighborhood || property.city}`,
      address: `${property.neighborhood || ""}, ${property.city}`,
      city: property.city || "",
      state: property.province || "",
      zipCode: "",
      price: property.price ? Number(property.price) : 0,
      bedrooms: property.bedrooms || 0,
      bathrooms:
        typeof property.bathrooms === "number"
          ? property.bathrooms
          : parseInt(property.bathrooms || "0") || 0,
      // Land flips the columns — resolveSquareMeter picks the plot on solar and
      // the useful area everywhere else. See ~/lib/surface.
      squareFeet:
        resolveSquareMeter(
          property.propertyType,
          property.squareMeter,
          property.builtSurfaceArea,
        ) ?? 0,
      description: "",
      features: [],
      propertyType:
        (property.propertyType?.toLowerCase() as PropertyType) || "piso",
      status:
        property.listingType === "Rent" ? "for-rent" : ("for-sale" as any),
      isFeatured: property.isFeatured || false,
      imageUrl: property.imageUrl || "/placeholder-property.jpg",
      images: [],
      energyCertification: null,
      hasElevator: false,
      hasGarage: false,
      hasStorageRoom: false,
    }));

    return {
      title: "Propiedades Destacadas",
      subtitle: "Descubre nuestra selección de propiedades disponibles",
      buttonText: "Ver Todas las Propiedades",
      itemsPerPage: 6,
      properties: formattedProperties,
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return {
      title: "Propiedades Destacadas",
      subtitle: "Descubre nuestra selección de propiedades disponibles",
      buttonText: "Ver Todas las Propiedades",
      itemsPerPage: 6,
      properties: [],
    };
  }
});
