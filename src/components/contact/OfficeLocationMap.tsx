"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { env } from "~/env";

interface OfficeLocationMapProps {
  address: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-muted">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function MapInner({ address }: OfficeLocationMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    null,
  );
  const [geocodeError, setGeocodeError] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    const geocoder = new google.maps.Geocoder();
    geocoder
      .geocode({ address })
      .then((res) => {
        if (cancelled) return;
        const loc = res.results[0]?.geometry.location;
        if (loc) {
          setPosition({ lat: loc.lat(), lng: loc.lng() });
        } else {
          setGeocodeError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setGeocodeError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, address]);

  if (loadError || geocodeError) {
    return <Placeholder label="Error al cargar el mapa" />;
  }

  if (!isLoaded || !position) {
    return <Placeholder label="Cargando mapa..." />;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      mapContainerClassName="rounded-md"
      center={position}
      zoom={15}
      options={{
        disableDefaultUI: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    >
      <Marker position={position} />
    </GoogleMap>
  );
}

export function OfficeLocationMap({ address }: OfficeLocationMapProps) {
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
    <div ref={containerRef} className="h-[150px] w-full">
      {shouldLoad ? (
        <MapInner address={address} />
      ) : (
        <Placeholder label="Cargando mapa..." />
      )}
    </div>
  );
}
