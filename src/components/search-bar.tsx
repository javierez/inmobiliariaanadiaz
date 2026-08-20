"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { isAccount137 } from "~/lib/account-overrides/137";
import {
  buildSearchSlug,
  normalizePropertyTypes,
  PROPERTY_TYPE_LABEL,
  type SearchParams,
  type PropertyType,
} from "~/lib/search-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TwoLevelLocationSelect } from "~/components/ui/two-level-location-select";

type ConcretePropertyType = Exclude<PropertyType, "any">;

interface SearchBarProps {
  initialParams?: SearchParams;
  provinces: string[];
  propertyTypes: string[];
  priceRange: { minPrice: number; maxPrice: number };
  accountId: string;
  /** Active free-text query, preserved across filter changes. */
  query?: string;
}

export function SearchBar({
  initialParams,
  provinces,
  propertyTypes,
  priceRange: _dbPriceRange,
  accountId,
  query,
}: SearchBarProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize state with provided params or defaults
  // The operation toggle is binary, but `status` can also be "any" (the "todo"
  // slug used by free-text search). Anything that isn't explicitly rent shows
  // as "Comprar" — casting "any" through would have displayed "Alquilar".
  const [searchMode, setSearchMode] = useState<"for-sale" | "for-rent">(
    initialParams?.status === "for-rent" ? "for-rent" : "for-sale",
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

  // Restore state from URL params
  useEffect(() => {
    if (!initialParams) return;

    if (initialParams.status)
      setSearchMode(
        initialParams.status === "for-rent" ? "for-rent" : "for-sale",
      );
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
  }, [initialParams]);

  // Handle search mode change
  const handleSearchModeChange = (value: string) => {
    const newMode = value === "comprar" ? "for-sale" : "for-rent";
    setSearchMode(newMode);
  };

  // Toggle a property type in the multi-select selection
  const togglePropertyType = (
    value: ConcretePropertyType,
    checked: boolean,
  ) => {
    setPropertyTypeSelection((prev) => {
      if (checked) {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      }
      return prev.filter((t) => t !== value);
    });
  };

  const propertyTypeButtonLabel = (() => {
    if (propertyTypeSelection.length === 0) return "Cualquier tipo";
    if (propertyTypeSelection.length === 1) {
      const t = propertyTypeSelection[0]!;
      return (
        (isAccount137() || t === "industrial"
          ? PROPERTY_TYPE_LABEL[t]
          : undefined) ?? t.charAt(0).toUpperCase() + t.slice(1)
      );
    }
    return `${propertyTypeSelection.length} tipos`;
  })();

  // Filter context for the location dropdowns — makes them show only
  // provinces/cities/neighborhoods that still have matching listings given
  // the other active filters.
  const locationFilters = {
    propertyType:
      propertyTypeSelection.length > 0 ? propertyTypeSelection : undefined,
    status: searchMode,
    bedrooms: bedrooms !== "any" ? Number.parseInt(bedrooms) : undefined,
    bathrooms: bathrooms !== "any" ? Number.parseInt(bathrooms) : undefined,
    minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
    minArea: minArea ? Number.parseInt(minArea) : undefined,
    maxArea: maxArea ? Number.parseInt(maxArea) : undefined,
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
      // Preserve extra characteristic filters (account-137 "Ver más") chosen
      // upstream — the results-page bar has no UI for them, so carry them
      // through verbatim instead of dropping them on re-search.
      amenities:
        initialParams?.amenities && initialParams.amenities.length > 0
          ? initialParams.amenities
          : undefined,
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
              value={searchMode === "for-sale" ? "comprar" : "alquilar"}
              onValueChange={handleSearchModeChange}
            >
              <SelectTrigger id="operation">
                <SelectValue placeholder="Seleccionar operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprar">Comprar</SelectItem>
                <SelectItem value="alquilar">Alquilar</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm">
              {searchMode === "for-sale" ? "Comprar" : "Alquilar"}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="property-type" className="text-sm font-medium">
            Tipo inmueble
          </Label>
          {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="property-type"
                  variant="outline"
                  className="flex h-10 w-full items-center justify-between px-3 font-normal"
                >
                  <span
                    className={
                      propertyTypeSelection.length === 0
                        ? "text-muted-foreground"
                        : ""
                    }
                  >
                    {propertyTypeButtonLabel}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)]"
                align="start"
              >
                {propertyTypes.map((type) => {
                  const value = type as ConcretePropertyType;
                  return (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={propertyTypeSelection.includes(value)}
                      onCheckedChange={(checked) =>
                        togglePropertyType(value, checked === true)
                      }
                      onSelect={(e) => e.preventDefault()}
                    >
                      {(isAccount137() || value === "industrial"
                        ? PROPERTY_TYPE_LABEL[value]
                        : undefined) ??
                        type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
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
            Habitaciones
          </Label>
          {mounted ? (
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Habitaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                <SelectItem value="1">+1</SelectItem>
                <SelectItem value="2">+2</SelectItem>
                <SelectItem value="3">+3</SelectItem>
                <SelectItem value="4">+4</SelectItem>
                <SelectItem value="5">+5</SelectItem>
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
            <Select value={bathrooms} onValueChange={setBathrooms}>
              <SelectTrigger id="bathrooms">
                <SelectValue placeholder="Baños" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Cualquiera</SelectItem>
                <SelectItem value="1">+1</SelectItem>
                <SelectItem value="2">+2</SelectItem>
                <SelectItem value="3">+3</SelectItem>
                <SelectItem value="4">+4</SelectItem>
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
              : "Precio de venta"}
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
