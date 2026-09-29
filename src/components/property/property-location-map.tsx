"use client";

import { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";
import { env } from "~/env";

interface PropertyLocationMapProps {
  lat: number;
  lng: number;
  locationVisibility: number | null; // 1=Exact, 2=Street, 3=Zone
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

type VisibilityConfig = {
  zoom: number;
  showMarker: boolean;
  showCircle: boolean;
  radius?: number;
};

const visibilityConfigs: Record<number, VisibilityConfig> = {
  1: { zoom: 17, showMarker: true, showCircle: false }, // Exact — precise pin
  // Street: hide the exact building. Show an approximate circle (~block) instead
  // of a marker so the precise address is never pinned, matching the "Calle"
  // intent (the text address also drops the house number).
  2: { zoom: 15, showMarker: false, showCircle: true, radius: 150 }, // Street
  3: { zoom: 14, showMarker: false, showCircle: true, radius: 300 }, // Zone
};

const defaultConfig: VisibilityConfig = {
  zoom: 17,
  showMarker: true,
  showCircle: false,
};

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  );
}

function MapInner({ lat, lng, locationVisibility }: PropertyLocationMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const visibility = locationVisibility ?? 1;
  const config = visibilityConfigs[visibility] ?? defaultConfig;
  const center = { lat, lng };

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
        <p className="text-muted-foreground">Error al cargar el mapa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <MapPlaceholder />;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      mapContainerClassName="rounded-lg"
      center={center}
      zoom={config.zoom}
      options={{
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      {config.showMarker && <Marker position={center} />}
      {config.showCircle && config.radius && (
        <Circle
          center={center}
          radius={config.radius}
          options={{
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
            strokeColor: "#3b82f6",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />
      )}
    </GoogleMap>
  );
}

export function PropertyLocationMap(props: PropertyLocationMapProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {shouldLoad ? <MapInner {...props} /> : <MapPlaceholder />}
    </div>
  );
}
