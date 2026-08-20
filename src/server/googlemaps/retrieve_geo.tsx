"use server";

import {
  findOrCreateLocation,
  type LocationData,
} from "~/server/queries/locations";

export interface GeocodingResult {
  latitude: string;
  longitude: string;
  neighborhood?: string;
  neighborhoodId?: number;
  city?: string;
  municipality?: string;
  province?: string;
}

/**
 * Retrieve geocoding data from OpenStreetMap Nominatim API
 * and handle neighborhood storage
 *
 * @param address - Full address string to geocode
 * @returns GeocodingResult or null if failed
 */
export async function retrieveGeocodingData(
  address: string,
): Promise<GeocodingResult | null> {
  try {
    // Call Nominatim API
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`;

    console.log(`Geocoding address: ${address}`);
    console.log(`API URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Vesta Real Estate Platform (contact@vesta.com)", // Nominatim requires User-Agent
      },
    });

    if (!response.ok) {
      console.error(
        `Nominatim API error: ${response.status} ${response.statusText}`,
      );
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.log(`No geocoding results found for address: ${address}`);
      return null;
    }

    const result = data[0];

    // Extract location data from API response
    const neighborhood =
      result.address?.suburb ||
      result.address?.neighbourhood ||
      result.address?.quarter;
    const municipality =
      result.address?.city || result.address?.town || result.address?.village;
    const province =
      result.address?.province ||
      result.address?.state ||
      result.address?.region;

    console.log(`Geocoding result:`, {
      lat: result.lat,
      lon: result.lon,
      neighborhood,
      municipality,
      province,
    });

    let neighborhoodId: number | undefined;

    // Create/Find neighborhood if neighborhood exists
    if (neighborhood && municipality && province) {
      try {
        const locationData: LocationData = {
          city: municipality,
          province: province,
          municipality: municipality,
          neighborhood: neighborhood,
        };

        neighborhoodId = await findOrCreateLocation(locationData);
        console.log(`Created/found neighborhood with ID: ${neighborhoodId}`);
      } catch (error) {
        console.error("Failed to create/find neighborhood:", error);
        // Continue without neighborhood ID - graceful degradation
      }
    } else {
      console.log("Insufficient location data to create neighborhood entry");
    }

    // Return formatted data
    return {
      latitude: result.lat,
      longitude: result.lon,
      neighborhood,
      neighborhoodId,
      city: municipality,
      municipality: municipality,
      province: province,
    };
  } catch (error) {
    console.error("Error in retrieveGeocodingData:", error);
    return null;
  }
}
