"use client";

import React, { useEffect, useRef, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { loadGoogleMapsApi } from "~/lib/google-maps-loader";
import type { ListingCardData } from "~/server/queries/listings";
import { PropertyMapCard } from "~/components/propiedades/maps/property-map-card";

interface PropertyMapProps {
  listings: ListingCardData[];
  watermarkEnabled?: boolean;
  className?: string;
}

const SPAIN_CENTER = { lat: 40.4168, lng: -3.7038 };
const SPAIN_ZOOM = 6;

// Approximate jitter radius (in metres) per location-visibility setting.
// 1 = exact, 2 = street (hide number), 3 = zone only. Listings detail page
// uses circles of similar magnitude — we keep pins here but offset them so
// the precise address is never leaked.
const JITTER_METERS: Record<number, number> = { 2: 80, 3: 350 };

// The public map must never show an exact address for ANY account: listings
// flagged "exact" (1) or with no setting still get at least street-level
// jitter. Per-listing settings (2/3) only ever increase the blur from here.
const MIN_JITTER_METERS = JITTER_METERS[2]!;

function hasValidCoords(listing: ListingCardData): boolean {
  if (!listing.latitude || !listing.longitude) return false;
  const lat = parseFloat(listing.latitude);
  const lng = parseFloat(listing.longitude);
  return !isNaN(lat) && !isNaN(lng);
}

// Deterministic [0, 1) hash from the listing id so the jitter is stable
// across renders/refreshes (otherwise the pin would move every load).
function hashUnit(seed: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function jitterCoords(
  lat: number,
  lng: number,
  visibility: number | null,
  seed: string,
): { lat: number; lng: number } {
  const radius =
    (visibility ? JITTER_METERS[visibility] : undefined) ?? MIN_JITTER_METERS;
  // Uniform distribution within a disc: r = R * sqrt(u), θ = 2π v.
  const u = hashUnit(seed, 1);
  const v = hashUnit(seed, 2);
  const r = radius * Math.sqrt(u);
  const theta = 2 * Math.PI * v;
  const dLat = (r * Math.cos(theta)) / 111320;
  const dLng =
    (r * Math.sin(theta)) / (111320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}

export const PropertyMap = React.memo(function PropertyMap({
  listings,
  watermarkEnabled = false,
  className,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const initMap = async () => {
      try {
        await loadGoogleMapsApi();
        if (cancelled || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: SPAIN_CENTER,
          zoom: SPAIN_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: "greedy",
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        setIsLoaded(true);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        if (!cancelled) setError("Error al cargar el mapa");
      }
    };

    void initMap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();

    const validListings = listings.filter(hasValidCoords);
    if (validListings.length === 0) {
      mapInstanceRef.current.setCenter(SPAIN_CENTER);
      mapInstanceRef.current.setZoom(SPAIN_ZOOM);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    const markers = validListings.map((listing) => {
      const rawLat = parseFloat(listing.latitude!);
      const rawLng = parseFloat(listing.longitude!);
      const position = jitterCoords(
        rawLat,
        rawLng,
        listing.fcLocationVisibility,
        String(listing.listingId),
      );
      bounds.extend(position);

      const marker = new google.maps.Marker({
        position,
        title:
          listing.title ??
          `${listing.propertyType ?? "Propiedad"}${listing.city ? ` en ${listing.city}` : ""}`,
      });

      marker.addListener("click", () => {
        if (!infoWindowRef.current || !mapInstanceRef.current) return;
        const content = PropertyMapCard({ listing, watermarkEnabled });
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      return marker;
    });

    markersRef.current = markers;
    clustererRef.current = new MarkerClusterer({
      map: mapInstanceRef.current,
      markers,
    });

    if (validListings.length === 1) {
      mapInstanceRef.current.setCenter(bounds.getCenter());
      mapInstanceRef.current.setZoom(15);
    } else {
      mapInstanceRef.current.fitBounds(bounds, 64);
      const listener = google.maps.event.addListener(
        mapInstanceRef.current,
        "idle",
        () => {
          if (!mapInstanceRef.current) return;
          const zoom = mapInstanceRef.current.getZoom();
          if (zoom && zoom > 15) mapInstanceRef.current.setZoom(15);
          google.maps.event.removeListener(listener);
        },
      );
    }
  }, [isLoaded, listings, watermarkEnabled]);

  const validCount = listings.filter(hasValidCoords).length;
  const missingCount = listings.length - validCount;

  if (error) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={mapRef}
          className="h-[60vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border/60 sm:h-[65vh] md:h-[70vh]"
          style={{ backgroundColor: "#e5e3df" }}
        />
        {!isLoaded && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-muted/40 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
              Cargando mapa…
            </p>
          </div>
        )}
      </div>
      {listings.length > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {validCount === 0
            ? "Ninguna propiedad de esta búsqueda tiene coordenadas."
            : `Mostrando ${validCount} ${validCount === 1 ? "propiedad" : "propiedades"} en el mapa`}
          {missingCount > 0 &&
            validCount > 0 &&
            ` (${missingCount} sin coordenadas)`}
        </p>
      )}
    </div>
  );
});
