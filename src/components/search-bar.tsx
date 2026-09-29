"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { isAccount137 } from "~/lib/account-overrides/137";
import {
  buildSearchSlug,
  MIN_BATHROOM_OPTIONS,
  MIN_BEDROOM_OPTIONS,
  normalizePropertyTypes,
  pruneSubtypes,
  subtypeOptionsFor,
  type SearchParams,
  type PropertyType,
  type SubtypeOption,
} from "~/lib/search-utils";
import { roomsFilterLabel, selectionHasRooms } from "~/lib/property-rooms";
import {
  PropertyTypeMenu,
  propertyTypeSummary,
} from "~/components/search/property-type-menu";
import { CharacteristicsFilter } from "~/components/search/characteristics-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TwoLevelLocationSelect } from "~/components/ui/two-level-location-select";

type ConcretePropertyType = Exclude<PropertyType, "any">;
type Operation = "for-sale" | "for-rent" | "any";

const OPERATION_OPTIONS: { value: string; mode: Operation; label: string }[] = [
  { value: "comprar", mode: "for-sale", label: "Comprar" },
  { value: "alquilar", mode: "for-rent", label: "Alquilar" },
  { value: "todas", mode: "any", label: "Comprar y alquilar" },
];
const OPERATION_BY_VALUE: Record<string, Operation> = Object.fromEntries(
  OPERATION_OPTIONS.map((o) => [o.value, o.mode]),
);

interface SearchBarProps {
  initialParams?: SearchParams;
  provinces: string[];
  propertyTypes: string[];
  subtypeOptions: SubtypeOption[];
  accountId: string;
  /** Active free-text query, preserved across filter changes. */
  query?: string;
}

export function SearchBar({
  initialParams,
  provinces,
  propertyTypes,
  subtypeOptions,
  accountId,
  query,
}: SearchBarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize state with provided params or defaults. La operación puede ser
  // "any" (el slug "todo" de la búsqueda por texto de la barra de navegación):
  // antes se pintaba como "Comprar" y el siguiente cambio de filtro mandaba a
  // /venta-…, y los alquileres desaparecían sin avisar.
  const [searchMode, setSearchMode] = useState<Operation>(
    initialParams?.status ?? "for-sale",
  );
  const [province, setProvince] = useState(initialParams?.province ?? "");
  const [cities, setCities] = useState<string[]>(initialParams?.cities ?? []);
  const [neighborhoodIds, setNeighborhoodIds] = useState<string[]>(
    initialParams?.neighborhoodIds ?? [],
  );
  const [propertyTypeSelection, setPropertyTypeSelection] = useState<
    ConcretePropertyType[]
  >(normalizePropertyTypes(initialParams?.propertyType));
  const [minPrice, setMinPrice] = useState<string>(
    initialParams?.minPrice ? initialParams.minPrice.toString() : "",
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialParams?.maxPrice ? initialParams.maxPrice.toString() : "",
  );
  const [bedrooms, setBedrooms] = useState<string>(
    initialParams?.bedrooms ?? "any",
  );
  const [bathrooms, setBathrooms] = useState<string>(
    initialParams?.bathrooms ?? "any",
  );
  const [minArea, setMinArea] = useState<string>(
    initialParams?.minArea ? initialParams.minArea.toString() : "",
  );
  const [maxArea, setMaxArea] = useState<string>(
    initialParams?.maxArea ? initialParams.maxArea.toString() : "",
  );
  const [subtypes, setSubtypes] = useState<string[]>(
    initialParams?.subtypes ?? [],
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialParams?.amenities ?? [],
  );
  const roomsApply = selectionHasRooms(propertyTypeSelection);

  // Restore state from URL params
  useEffect(() => {
    if (!initialParams) return;

    if (initialParams.status) setSearchMode(initialParams.status);
    setPropertyTypeSelection(
      normalizePropertyTypes(initialParams.propertyType),
    );
    if (initialParams.province) setProvince(initialParams.province);
    if (initialParams.minPrice) setMinPrice(initialParams.minPrice.toString());
    if (initialParams.maxPrice) setMaxPrice(initialParams.maxPrice.toString());
    if (initialParams.bedrooms) setBedrooms(initialParams.bedrooms);
    if (initialParams.bathrooms) setBathrooms(initialParams.bathrooms);
    if (initialParams.minArea) setMinArea(initialParams.minArea.toString());
    if (initialParams.maxArea) setMaxArea(initialParams.maxArea.toString());

    // Restore cities / neighborhoodIds from URL.
    setCities(initialParams.cities ?? []);
    setNeighborhoodIds(initialParams.neighborhoodIds ?? []);
    setSubtypes(initialParams.subtypes ?? []);
    setAmenities(initialParams.amenities ?? []);
  }, [initialParams]);

  // Handle search mode change
  const handleSearchModeChange = (value: string) => {
    setSearchMode(OPERATION_BY_VALUE[value] ?? "for-sale");
  };

  // Toggle a property type in the multi-select selection. Un subtipo de un tipo
  // desmarcado, o habitaciones en una selección que ya no las tiene (garaje,
  // nave…), acotarían a cero sin que se viera por qué.
  const togglePropertyType = (
    value: ConcretePropertyType,
    checked: boolean,
  ) => {
    if (checked === propertyTypeSelection.includes(value)) return;
    const next = checked
      ? [...propertyTypeSelection, value]
      : propertyTypeSelection.filter((t) => t !== value);
    setPropertyTypeSelection(next);
    setSubtypes((prev) => pruneSubtypes(prev, next));
    if (!selectionHasRooms(next)) {
      setBedrooms("any");
      setBathrooms("any");
    }
  };

  const toggleSubtype = (key: string, checked: boolean) => {
    setSubtypes((prev) =>
      checked
        ? Array.from(new Set([...prev, key]))
        : prev.filter((k) => k !== key),
    );
  };

  const toggleAmenity = (key: string, checked: boolean) => {
    setAmenities((prev) =>
      checked
        ? Array.from(new Set([...prev, key]))
        : prev.filter((k) => k !== key),
    );
  };

  const propertyTypeButtonLabel = propertyTypeSummary(
    propertyTypeSelection,
    subtypes,
    subtypeOptions,
    "Cualquier tipo",
  );

  // Filter context for the location dropdowns — makes them show only
  // provinces/cities/neighborhoods that still have matching listings given
  // the other active filters.
  const locationFilters = {
    propertyType:
      propertyTypeSelection.length > 0 ? propertyTypeSelection : undefined,
    status: searchMode === "any" ? undefined : searchMode,
    bedrooms: bedrooms !== "any" ? Number.parseInt(bedrooms) : undefined,
    bathrooms: bathrooms !== "any" ? Number.parseInt(bathrooms) : undefined,
    minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
    minArea: minArea ? Number.parseInt(minArea) : undefined,
    maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
    amenities: amenities.length > 0 ? amenities : undefined,
    subtypes: subtypes.length > 0 ? subtypes : undefined,
  };

  const handleSearch = () => {
    const searchParams: SearchParams = {
      cities: cities.length > 0 ? cities : undefined,
      neighborhoodIds: neighborhoodIds.length > 0 ? neighborhoodIds : undefined,
      province: province || undefined,
      propertyType:
        propertyTypeSelection.length > 0 ? propertyTypeSelection : undefined,
      bedrooms: bedrooms === "any" ? undefined : bedrooms,
      bathrooms: bathrooms === "any" ? undefined : bathrooms,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      minArea: minArea ? Number.parseInt(minArea) : undefined,
      maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
      status: searchMode,
      amenities: amenities.length > 0 ? amenities : undefined,
      subtypes: subtypes.length > 0 ? subtypes : undefined,
      // La categoría de la página (Oportunidad, Destacados…) se conserva al
      // refinar; antes se perdía y salía todo el catálogo en venta.
      isOportunidad: initialParams?.isOportunidad,
      isBankOwned: initialParams?.isBankOwned,
      isFeatured: initialParams?.isFeatured,
    };

    const searchSlug = buildSearchSlug(searchParams);
    // Carry the free-text query through a filter change, otherwise refining
    // "calle mayor" by price would silently drop the text and show everything.
    router.push(
      query
        ? `/${searchSlug}?q=${encodeURIComponent(query)}`
        : `/${searchSlug}`,
    );
  };

  return (
    <div className="relative z-10 mx-auto -mt-8 w-full max-w-6xl rounded-lg bg-white p-4 shadow-lg sm:p-6">
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-6">
        <div>
          <Label htmlFor="operation" className="text-sm font-medium">
            Operación
          </Label>
          {mounted ? (
            <Select
              value={OPERATION_OPTIONS.find((o) => o.mode === searchMode)!.value}
              onValueChange={handleSearchModeChange}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Seleccionar operación" />
              </SelectTrigger>
              <SelectContent>
                {OPERATION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm">
              {OPERATION_OPTIONS.find((o) => o.mode === searchMode)!.label}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="property-type" className="text-sm font-medium">
            Tipo inmueble
          </Label>
          {mounted ? (
            <PropertyTypeMenu
              id="property-type"
              types={propertyTypes}
              selectedTypes={propertyTypeSelection}
              onToggleType={togglePropertyType}
              subtypeOptions={subtypeOptionsFor(subtypeOptions, searchMode)}
              selectedSubtypes={subtypes}
              onToggleSubtype={toggleSubtype}
              placeholder="Cualquier tipo"
            />
          ) : (
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm">
              {propertyTypeButtonLabel}
            </div>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2 lg:col-span-2">
          <Label className="text-sm font-medium">Ubicación</Label>
          {mounted ? (
            <TwoLevelLocationSelect
              initialProvinces={provinces}
              accountId={accountId}
              selectedProvince={province}
              selectedCities={cities}
              selectedNeighborhoodIds={neighborhoodIds}
              filters={locationFilters}
              onProvinceChange={setProvince}
              onSelectionChange={({
                cities: nextCities,
                neighborhoodIds: nextIds,
              }) => {
                setCities(nextCities);
                setNeighborhoodIds(nextIds);
              }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                Selecciona provincia...
              </div>
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm text-muted-foreground">
                Selecciona ubicación...
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bedrooms" className="text-sm font-medium">
            {roomsFilterLabel(propertyTypeSelection)}
          </Label>
          {mounted ? (
            <Select
              value={bedrooms}
              onValueChange={setBedrooms}
              disabled={!roomsApply}
            >
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Cualquiera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                {MIN_BEDROOM_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>
                    +{n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm">
              {bedrooms === "any" ? "Cualquiera" : `+${bedrooms}`}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bathrooms" className="text-sm font-medium">
            Baños
          </Label>
          {mounted ? (
            <Select
              value={bathrooms}
              onValueChange={setBathrooms}
              disabled={!roomsApply}
            >
              <SelectTrigger id="bathrooms">
                <SelectValue placeholder="Baños" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                {MIN_BATHROOM_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>
                    +{n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm">
              {bathrooms === "any" ? "Cualquiera" : `+${bathrooms}`}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div>
          <Label className="text-sm font-medium">Superficie</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Desde"
                value={minArea}
                onChange={(e) => setMinArea(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Hasta"
                value={maxArea}
                onChange={(e) => setMaxArea(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">
            {searchMode === "for-rent"
              ? "Precio de alquiler"
              : searchMode === "for-sale"
                ? "Precio de venta"
                : "Precio"}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Desde"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Hasta"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <CharacteristicsFilter
          selected={amenities}
          onToggle={toggleAmenity}
          defaultOpen={amenities.length > 0}
        />
      </div>

      <div className="flex justify-center sm:justify-end">
        <Button
          onClick={handleSearch}
          className={`w-full px-6 sm:w-auto sm:px-8 ${isAccount137() ? "!bg-[#14532d] !text-white hover:!bg-[#14532d]/90" : ""}`}
        >
          Buscar
        </Button>
      </div>
    </div>
  );
}
