import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { env } from "~/env";

let loadPromise: Promise<void> | null = null;

/**
 * Loads the Google Maps JavaScript API with the Places library.
 * Singleton — only loads once, subsequent calls return the same promise.
 */
export async function loadGoogleMapsApi(): Promise<void> {
  if (typeof google !== "undefined" && google.maps?.places) {
    return;
  }

  if (loadPromise) {
    return loadPromise;
  }

  setOptions({
    key: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    v: "weekly",
    language: "es",
    libraries: ["places"],
  });

  loadPromise = importLibrary("places").then(() => undefined);
  loadPromise.catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}
