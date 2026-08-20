"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toLocationKey } from "~/lib/location-normalization";
import {
  getCitiesAndNeighborhoodsByProvince,
  getProvinces,
} from "~/server/actions/locations";
import type { NonLocationFilters } from "~/server/queries/search-filters";

export interface CityWithNeighborhoods {
  city: string;
  neighborhoods: { neighborhoodId: bigint; neighborhood: string }[];
}

export interface LocationSelection {
  cities: string[];
  neighborhoodIds: string[];
}

interface TwoLevelLocationSelectProps {
  // Initial list rendered on first paint (from the server). The component
  // re-fetches client-side whenever `filters` narrow / widen the result set.
  initialProvinces: string[];
  accountId: string;
  selectedProvince?: string;
  selectedCities: string[];
  selectedNeighborhoodIds: string[];
  // Current non-location filters — when these change, the available
  // provinces / cities / neighborhoods narrow to places that still have
  // matching listings.
  filters?: NonLocationFilters;
  onProvinceChange: (province: string) => void;
  onSelectionChange: (next: LocationSelection) => void;
  provincePlaceholder?: string;
  locationPlaceholder?: string;
}

// Simple searchable select for province dropdown (single-select).
function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder = "Buscar...",
  disabled = false,
  loading = false,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!search) return options;
    const searchKey = toLocationKey(search);
    return options.filter((o) => toLocationKey(o.label).includes(searchKey));
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !selectedLabel && "text-muted-foreground",
        )}
      >
        <span className="line-clamp-1">
          {loading ? "Cargando..." : selectedLabel || placeholder}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center truncate rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value === option.value && "bg-accent",
                  )}
                >
                  {value === option.value && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Small checkbox visual (not a real input — rows are buttons).
function CheckboxBox({
  checked,
  disabled = false,
}: {
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
        checked
          ? "border-brand bg-brand text-brand-foreground"
          : "border-input bg-background",
        disabled && "opacity-40",
      )}
    >
      {checked && <Check className="h-3 w-3" />}
    </span>
  );
}

// City + Neighborhood combined dropdown (multi-select).
function CityNeighborhoodSelect({
  citiesData,
  selectedCities,
  selectedNeighborhoodIds,
  onToggleCity,
  onToggleNeighborhood,
  onClearAll,
  placeholder,
  searchPlaceholder = "Buscar...",
  disabled = false,
  loading = false,
}: {
  citiesData: CityWithNeighborhoods[];
  selectedCities: string[];
  selectedNeighborhoodIds: string[];
  onToggleCity: (city: string) => void;
  onToggleNeighborhood: (city: string, neighborhoodId: string) => void;
  onClearAll: () => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [expandedCities, setExpandedCities] = React.useState<Set<string>>(
    new Set(),
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const citySet = React.useMemo(
    () => new Set(selectedCities),
    [selectedCities],
  );
  const neighborhoodSet = React.useMemo(
    () => new Set(selectedNeighborhoodIds),
    [selectedNeighborhoodIds],
  );
  const totalSelected = selectedCities.length + selectedNeighborhoodIds.length;

  // Trigger label
  const triggerLabel = React.useMemo(() => {
    if (totalSelected === 0) return null;
    if (totalSelected === 1) {
      if (selectedCities.length === 1) return selectedCities[0]!;
      const id = selectedNeighborhoodIds[0]!;
      for (const c of citiesData) {
        const hood = c.neighborhoods.find(
          (n) => n.neighborhoodId.toString() === id,
        );
        if (hood) return `${hood.neighborhood}, ${c.city}`;
      }
      return "1 ubicación";
    }
    return `${totalSelected} ubicaciones`;
  }, [citiesData, selectedCities, selectedNeighborhoodIds, totalSelected]);

  // For each city, determine if it should show as a single collapsed row
  // (no expandable neighborhoods) — same rule as before.
  const shouldCollapse = (cityData: CityWithNeighborhoods) => {
    if (cityData.neighborhoods.length === 0) return true;
    if (cityData.neighborhoods.length === 1) {
      const hood = cityData.neighborhoods[0]!;
      if (hood.neighborhood.toLowerCase() === cityData.city.toLowerCase())
        return true;
    }
    return false;
  };

  const filteredData = React.useMemo(() => {
    if (!search) return citiesData;
    const searchKey = toLocationKey(search);
    return citiesData
      .map((cityData) => {
        const cityMatches = toLocationKey(cityData.city).includes(searchKey);
        const matchingNeighborhoods = cityData.neighborhoods.filter((n) =>
          toLocationKey(n.neighborhood).includes(searchKey),
        );
        if (cityMatches) return cityData;
        if (matchingNeighborhoods.length > 0) {
          return { ...cityData, neighborhoods: matchingNeighborhoods };
        }
        return null;
      })
      .filter(Boolean) as CityWithNeighborhoods[];
  }, [citiesData, search]);

  const toggleExpanded = (city: string) => {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      if (next.has(city)) {
        next.delete(city);
      } else {
        next.add(city);
      }
      return next;
    });
  };

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          !triggerLabel && "text-muted-foreground",
        )}
      >
        <span className="line-clamp-1">
          {loading ? "Cargando..." : (triggerLabel ?? placeholder)}
        </span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {/* "All" option — clears selection */}
            <button
              type="button"
              onClick={() => {
                onClearAll();
              }}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center gap-2 truncate rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                totalSelected === 0 && "bg-accent",
              )}
            >
              <CheckboxBox checked={totalSelected === 0} />
              Toda la provincia
            </button>

            {filteredData.length === 0 ? (
              <p className="px-3 py-2 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              filteredData.map((cityData) => {
                const collapsed = shouldCollapse(cityData);
                const isExpanded = expandedCities.has(cityData.city);
                const isCityChecked = citySet.has(cityData.city);

                if (collapsed) {
                  return (
                    <button
                      key={cityData.city}
                      type="button"
                      onClick={() => onToggleCity(cityData.city)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center gap-2 truncate rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                        isCityChecked && "bg-accent",
                      )}
                    >
                      <CheckboxBox checked={isCityChecked} />
                      {cityData.city}
                    </button>
                  );
                }

                // Expandable city with neighborhoods — chevron on the right
                // so the checkbox + label stay left-aligned with every other
                // row in the list.
                return (
                  <div key={cityData.city}>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => onToggleCity(cityData.city)}
                        className={cn(
                          "relative flex flex-1 cursor-pointer select-none items-center gap-2 truncate rounded-sm py-1.5 pl-2 pr-2 text-sm font-medium outline-none hover:bg-accent hover:text-accent-foreground",
                          isCityChecked && "bg-accent",
                        )}
                      >
                        <CheckboxBox checked={isCityChecked} />
                        {cityData.city}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(cityData.city)}
                        className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm hover:bg-accent"
                        aria-label={isExpanded ? "Colapsar" : "Expandir"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        ) : (
                          <ChevronRight className="h-3 w-3 opacity-50" />
                        )}
                      </button>
                    </div>

                    {isExpanded &&
                      cityData.neighborhoods.map((hood) => {
                        const idStr = hood.neighborhoodId.toString();
                        const isHoodChecked = neighborhoodSet.has(idStr);
                        // When the whole city is checked, child neighborhoods
                        // are implicitly included — disable the toggle.
                        const hoodDisabled = isCityChecked;
                        return (
                          <button
                            key={idStr}
                            type="button"
                            disabled={hoodDisabled}
                            onClick={() => {
                              if (!hoodDisabled) {
                                onToggleNeighborhood(cityData.city, idStr);
                              }
                            }}
                            className={cn(
                              "relative flex w-full select-none items-center gap-2 truncate rounded-sm py-1.5 pl-6 pr-2 text-sm outline-none",
                              hoodDisabled
                                ? "cursor-not-allowed text-muted-foreground"
                                : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              !hoodDisabled && isHoodChecked && "bg-accent",
                            )}
                          >
                            <CheckboxBox
                              checked={isHoodChecked || isCityChecked}
                              disabled={hoodDisabled}
                            />
                            {hood.neighborhood}
                          </button>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t p-2">
            <button
              type="button"
              onClick={() => onClearAll()}
              className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              disabled={totalSelected === 0}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSearch("");
              }}
              className="rounded-md bg-brand px-3 py-1 text-xs font-medium text-brand-foreground hover:opacity-90"
            >
              Hecho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Stable stringification of the filter context so effect deps can compare
// it cheaply (the parent passes a fresh object every render).
function filtersKey(f?: NonLocationFilters): string {
  if (!f) return "";
  const pt = Array.isArray(f.propertyType)
    ? [...f.propertyType].sort().join(",")
    : (f.propertyType ?? "");
  return [
    pt,
    f.status ?? "",
    f.bedrooms ?? "",
    f.bathrooms ?? "",
    f.minPrice ?? "",
    f.maxPrice ?? "",
    f.minArea ?? "",
    f.maxArea ?? "",
    f.isOportunidad ? "1" : "0",
    f.isBankOwned ? "1" : "0",
    f.isFeatured ? "1" : "0",
  ].join("|");
}

export function TwoLevelLocationSelect({
  initialProvinces,
  accountId,
  selectedProvince,
  selectedCities,
  selectedNeighborhoodIds,
  filters,
  onProvinceChange,
  onSelectionChange,
  provincePlaceholder = "Selecciona provincia...",
  locationPlaceholder = "Selecciona ubicación...",
}: TwoLevelLocationSelectProps) {
  const [provinces, setProvinces] = React.useState<string[]>(initialProvinces);
  const [citiesData, setCitiesData] = React.useState<CityWithNeighborhoods[]>(
    [],
  );
  const [loadingCities, setLoadingCities] = React.useState(false);
  // Key = `${province}|${filtersKey}` — dedup repeated fetches for the same
  // (province, filters) pair.
  const loadedKeyRef = React.useRef<string | null>(null);
  const fKey = filtersKey(filters);

  const provinceOptions = React.useMemo(() => {
    return [
      { value: "all", label: "Todas las provincias" },
      ...provinces.map((p) => ({ value: p, label: p })),
    ];
  }, [provinces]);

  const inflightKeyRef = React.useRef<string | null>(null);
  const loadCities = React.useCallback(
    async (
      province: string,
      snapshot: NonLocationFilters | undefined,
      key: string,
    ) => {
      inflightKeyRef.current = key;
      setLoadingCities(true);
      try {
        const data = await getCitiesAndNeighborhoodsByProvince(
          province,
          BigInt(accountId),
          snapshot,
        );
        // A newer fetch may have started while this one was in flight.
        // Only apply the result if we're still the latest.
        if (inflightKeyRef.current !== key) return;
        setCitiesData(data);
        loadedKeyRef.current = key;
      } catch (error) {
        if (inflightKeyRef.current !== key) return;
        console.error("Error loading cities:", error);
        setCitiesData([]);
        loadedKeyRef.current = null;
      } finally {
        if (inflightKeyRef.current === key) setLoadingCities(false);
      }
    },
    [accountId],
  );

  // Refetch provinces whenever the non-location filters change — provinces
  // with zero matching listings should disappear from the picker.
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await getProvinces(BigInt(accountId), filters);
        if (!cancelled) setProvinces(next);
      } catch (err) {
        console.error("Error refetching provinces:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, fKey]);

  // Auto-clear `selectedProvince` when filters remove it from the option list.
  // La comparación es por clave normalizada (igual que con las ciudades): la
  // provincia puede llegar de la URL con otra grafía que la que devuelve la BD,
  // y ahí lo correcto es adoptar la de la lista, no borrar la selección.
  React.useEffect(() => {
    if (!selectedProvince) return;
    const match = provinces.find(
      (p) => toLocationKey(p) === toLocationKey(selectedProvince),
    );
    if (!match) {
      onProvinceChange("");
      onSelectionChange({ cities: [], neighborhoodIds: [] });
    } else if (match !== selectedProvince) {
      onProvinceChange(match);
    }
  }, [provinces, selectedProvince, onProvinceChange, onSelectionChange]);

  // Load cities for the current (province, filters) pair.
  React.useEffect(() => {
    if (!selectedProvince) {
      setCitiesData([]);
      loadedKeyRef.current = null;
      return;
    }
    const key = `${selectedProvince}|${fKey}`;
    if (loadedKeyRef.current === key) return;
    void loadCities(selectedProvince, filters, key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince, fKey, loadCities]);

  // Auto-clear selected cities / neighborhoods that disappeared from the
  // freshly-loaded citiesData (e.g. picking "garaje" erased "Málaga"), y de
  // paso canonicaliza el nombre.
  //
  // Dos condiciones que no son opcionales:
  //  - Solo se poda cuando `citiesData` corresponde ya a la (provincia,
  //    filtros) actual. En el primer render `citiesData` está vacío y
  //    `loadingCities` todavía es `false` (la petición arranca en otro efecto
  //    del mismo commit), así que sin esta guarda toda selección que llegue
  //    desde la URL se borraba nada más pintar la página.
  //  - La comparación es por clave normalizada: la URL trae "astorga" y la BD
  //    guarda "Astorga", así que un `Set.has` literal no encontraba la ciudad
  //    y la daba por desaparecida.
  React.useEffect(() => {
    if (!selectedProvince) return;
    if (loadingCities) return;
    if (loadedKeyRef.current !== `${selectedProvince}|${fKey}`) return;
    const cityByKey = new Map(citiesData.map((c) => [toLocationKey(c.city), c]));
    const availableHoodIds = new Set(
      citiesData.flatMap((c) =>
        c.neighborhoods.map((n) => n.neighborhoodId.toString()),
      ),
    );
    const prunedCities = selectedCities
      .map((c) => cityByKey.get(toLocationKey(c))?.city)
      .filter((c): c is string => !!c);
    const prunedHoods = selectedNeighborhoodIds.filter((id) =>
      availableHoodIds.has(id),
    );
    if (
      prunedCities.length !== selectedCities.length ||
      prunedCities.some((c, i) => c !== selectedCities[i]) ||
      prunedHoods.length !== selectedNeighborhoodIds.length
    ) {
      onSelectionChange({ cities: prunedCities, neighborhoodIds: prunedHoods });
    }
  }, [
    citiesData,
    fKey,
    loadingCities,
    selectedProvince,
    selectedCities,
    selectedNeighborhoodIds,
    onSelectionChange,
  ]);

  const handleProvinceSelect = (province: string) => {
    if (province === "all") {
      onProvinceChange("");
      onSelectionChange({ cities: [], neighborhoodIds: [] });
      setCitiesData([]);
      loadedKeyRef.current = null;
      return;
    }

    onProvinceChange(province);
    onSelectionChange({ cities: [], neighborhoodIds: [] });
    // The useEffect watching `selectedProvince` will load cities.
  };

  const handleToggleCity = (city: string) => {
    const has = selectedCities.includes(city);
    if (has) {
      onSelectionChange({
        cities: selectedCities.filter((c) => c !== city),
        neighborhoodIds: selectedNeighborhoodIds,
      });
      return;
    }
    // Adding a whole city — drop any of its neighborhoods from the selection
    // (the whole city covers them).
    const cityData = citiesData.find((c) => c.city === city);
    const cityHoodIds = new Set(
      (cityData?.neighborhoods ?? []).map((n) => n.neighborhoodId.toString()),
    );
    onSelectionChange({
      cities: [...selectedCities, city],
      neighborhoodIds: selectedNeighborhoodIds.filter(
        (id) => !cityHoodIds.has(id),
      ),
    });
  };

  const handleToggleNeighborhood = (_city: string, neighborhoodId: string) => {
    const has = selectedNeighborhoodIds.includes(neighborhoodId);
    onSelectionChange({
      cities: selectedCities,
      neighborhoodIds: has
        ? selectedNeighborhoodIds.filter((id) => id !== neighborhoodId)
        : [...selectedNeighborhoodIds, neighborhoodId],
    });
  };

  const handleClearAll = () => {
    onSelectionChange({ cities: [], neighborhoodIds: [] });
  };

  const provinceValue =
    !selectedProvince || selectedProvince === "" ? "all" : selectedProvince;

  return (
    <div className="grid grid-cols-2 gap-2">
      <SearchableSelect
        options={provinceOptions}
        value={provinceValue}
        onSelect={handleProvinceSelect}
        placeholder={provincePlaceholder}
        searchPlaceholder="Buscar provincia..."
      />
      <CityNeighborhoodSelect
        citiesData={citiesData}
        selectedCities={selectedCities}
        selectedNeighborhoodIds={selectedNeighborhoodIds}
        onToggleCity={handleToggleCity}
        onToggleNeighborhood={handleToggleNeighborhood}
        onClearAll={handleClearAll}
        placeholder={
          !selectedProvince
            ? "Primero selecciona provincia"
            : loadingCities
              ? "Cargando..."
              : locationPlaceholder
        }
        searchPlaceholder="Buscar ciudad o barrio..."
        disabled={!selectedProvince || loadingCities}
        loading={loadingCities}
      />
    </div>
  );
}
