"use client";

import { useEffect, useRef, useState } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { Input } from "~/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { loadGoogleMapsApi } from "~/lib/google-maps-loader";
import { cn } from "~/lib/utils";

export interface AddressComponents {
  streetNumber: string;
  route: string;
  locality: string;
  province: string;
  postalCode: string;
  subpremise: string;
}

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  components: AddressComponents;
}

function parseGeocoderComponents(
  components: google.maps.GeocoderAddressComponent[],
): AddressComponents {
  const result: AddressComponents = {
    streetNumber: "",
    route: "",
    locality: "",
    province: "",
    postalCode: "",
    subpremise: "",
  };

  for (const c of components) {
    const type = c.types[0];
    switch (type) {
      case "street_number":
        result.streetNumber = c.long_name;
        break;
      case "route":
        result.route = c.long_name;
        break;
      case "locality":
        result.locality = c.long_name;
        break;
      case "administrative_area_level_2":
        result.province = c.long_name;
        break;
      case "postal_code":
        result.postalCode = c.long_name;
        break;
      case "subpremise":
        result.subpremise = c.long_name;
        break;
    }
  }

  return result;
}

/**
 * Parse subpremise (e.g. "3º B") into floor and door.
 */
export function parseSubpremise(subpremise: string): {
  floor?: string;
  door?: string;
} {
  if (!subpremise) return {};
  const s = subpremise.trim();

  // "3º B", "2ª A"
  const ordinal = /^(\d+)[ºªo°]\s*(.*)$/i.exec(s);
  if (ordinal) {
    return { floor: ordinal[1], door: ordinal[2]?.trim() || undefined };
  }

  // "Piso 3 Puerta B"
  const piso = /(?:piso|planta|pl)\s*(\d+)\s*(?:puerta|pta|pu)?\s*(.*)/i.exec(
    s,
  );
  if (piso) {
    return { floor: piso[1], door: piso[2]?.trim() || undefined };
  }

  // "Bajo A"
  const bajo = /^bajo\s*(.*)/i.exec(s);
  if (bajo) {
    return { floor: "0", door: bajo[1]?.trim() || undefined };
  }

  // "3 B", "2A"
  const simple = /^(\d+)\s*([A-Za-z].*)?$/.exec(s);
  if (simple) {
    return { floor: simple[1], door: simple[2]?.trim() || undefined };
  }

  return {};
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelected: (data: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export function AddressAutocomplete({
  value,
  onChange,
  onLocationSelected,
  placeholder = "Buscar dirección...",
  className,
  disabled = false,
  hasError = false,
}: AddressAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadGoogleMapsApi()
      .then(() => {
        if (mounted) {
          setIsApiLoaded(true);
          setIsLoadingApi(false);
        }
      })
      .catch(() => {
        if (mounted) setIsLoadingApi(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const {
    ready,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    initOnMount: false,
    requestOptions: {
      componentRestrictions: { country: "es" },
      types: ["address"],
    },
    debounce: 300,
    cache: 24 * 60 * 60,
  });

  useEffect(() => {
    if (isApiLoaded) init();
  }, [isApiLoaded, init]);

  // Sync external value
  useEffect(() => {
    if (isApiLoaded && ready) {
      setValue(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelect = (
    suggestion: google.maps.places.AutocompletePrediction,
  ) => {
    const selectedAddress = suggestion.description;
    setValue(selectedAddress, false);
    onChange(selectedAddress);
    setOpen(false);
    clearSuggestions();

    void (async () => {
      try {
        const results = await getGeocode({ address: selectedAddress });
        if (!results[0]) return;
        const { lat, lng } = getLatLng(results[0]);
        const components = parseGeocoderComponents(
          results[0].address_components,
        );

        onLocationSelected({ address: selectedAddress, lat, lng, components });
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    })();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (isApiLoaded && ready) {
      setValue(newValue);
      setOpen(newValue.length >= 3);
    }
  };

  const showDropdown = open && status === "OK" && data.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder={
            isLoadingApi
              ? "Cargando Google Maps..."
              : isApiLoaded && ready
                ? placeholder
                : "Escribir dirección..."
          }
          className={cn(className, hasError && "border-red-500")}
          onFocus={() => {
            if (value.length >= 3 && status === "OK" && isApiLoaded) {
              setOpen(true);
            }
          }}
        />
        {isLoadingApi && (
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-white shadow-lg">
          <div className="max-h-[300px] overflow-y-auto">
            {data.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="flex w-full items-start gap-2 border-b p-3 text-left transition-colors last:border-b-0 hover:bg-accent"
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-medium">
                    {suggestion.structured_formatting.main_text}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {suggestion.structured_formatting.secondary_text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
