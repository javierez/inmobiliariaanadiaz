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

// Las coordenadas llegan ya desplazadas desde el servidor según la visibilidad
// de cada anuncio (~/lib/location-privacy): aquí se pintan tal cual. Antes el
// desplazamiento se hacía en el navegador, con las exactas ya descargadas.

function hasValidCoords(listing: ListingCardData): boolean {
  if (!listing.latitude || !listing.longitude) return false;
  const lat = parseFloat(listing.latitude);
  const lng = parseFloat(listing.longitude);
  return !isNaN(lat) && !isNaN(lng);
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
      const position = {
        lat: parseFloat(listing.latitude!),
        lng: parseFloat(listing.longitude!),
      };
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
