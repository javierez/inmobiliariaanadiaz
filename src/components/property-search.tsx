"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Slider } from "~/components/ui/slider";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  buildSearchSlug,
  MIN_BATHROOM_OPTIONS,
  MIN_BEDROOM_OPTIONS,
  pruneSubtypes,
  subtypeOptionsFor,
  type PropertyType,
  type SearchParams,
  type SubtypeOption,
} from "~/lib/search-utils";
import { roomsFilterLabel, selectionHasRooms } from "~/lib/property-rooms";
import { TwoLevelLocationSelect } from "~/components/ui/two-level-location-select";
import { PropertyTypeMenu } from "~/components/search/property-type-menu";
import { CharacteristicsFilter } from "~/components/search/characteristics-filter";
import { staggerContainer, staggerItem } from "~/lib/animations";
import { isAccount137 } from "~/lib/account-overrides/137";

type ConcretePropertyType = Exclude<PropertyType, "any">;
type Operation = "for-sale" | "for-rent";
interface PriceBounds {
  minPrice: number;
  maxPrice: number;
}

interface SearchFormData {
  province: string;
  cities: string[];
  neighborhoodIds: string[];
  propertyTypes: ConcretePropertyType[];
  bedrooms: string;
  bathrooms: string;
  status: "for-sale" | "for-rent";
  amenities: string[];
  subtypes: string[];
}

interface PropertySearchProps {
  provinces: string[];
  propertyTypes: string[];
  subtypeOptions: SubtypeOption[];
  /** Precio mínimo/máximo publicado, por operación. */
  priceRanges: Record<Operation, PriceBounds>;
  accountId: string;
  logoUrl?: string | null;
}

export function PropertySearch({
  provinces,
  propertyTypes,
  subtypeOptions,
  priceRanges,
  accountId,
  logoUrl,
}: PropertySearchProps) {
  const router = useRouter();
  // El deslizador parte de todo el rango de la operación elegida y solo manda
  // el extremo que el visitante movió. Antes arrancaba en 50.000 € y al tocar
  // un extremo mandaba los dos: "hasta 300.000 €" añadía "desde 50.000 €", y
  // en alquiler eso dejaba cero resultados.
  const [priceRange, setPriceRange] = useState<number[]>([
    priceRanges["for-sale"].minPrice,
    priceRanges["for-sale"].maxPrice,
  ]);
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    province: "",
    cities: [],
    neighborhoodIds: [],
    propertyTypes: [],
    bedrooms: "any",
    bathrooms: "any",
    status: "for-sale",
    amenities: [],
    subtypes: [],
  });
  // ¿Aplica habitaciones/baños a los tipos elegidos? (No a garaje, nave…)
  const roomsApply = selectionHasRooms(searchParams.propertyTypes);

  const handleSelectChange = (
    name: "province" | "bedrooms" | "bathrooms" | "status",
    value: string,
  ) => {
    setSearchParams((prev) => {
      const next = { ...prev, [name]: value };
      // Clear cities/neighborhoods when province changes
      if (name === "province") {
        next.cities = [];
        next.neighborhoodIds = [];
      }
      return next;
    });
    // Otra operación, otro rango de precios: el de venta no sirve en alquiler.
    if (name === "status") {
      const bounds = priceRanges[value as Operation];
      setPriceRange([bounds.minPrice, bounds.maxPrice]);
    }
  };

  const bounds = priceRanges[searchParams.status];
  const minPriceFilter =
    (priceRange[0] ?? bounds.minPrice) > bounds.minPrice
      ? priceRange[0]
      : undefined;
  const maxPriceFilter =
    (priceRange[1] ?? bounds.maxPrice) < bounds.maxPrice
      ? priceRange[1]
      : undefined;

  const handleLocationSelectionChange = (selection: {
    cities: string[];
    neighborhoodIds: string[];
  }) => {
    setSearchParams((prev) => ({
      ...prev,
      cities: selection.cities,
      neighborhoodIds: selection.neighborhoodIds,
    }));
  };

  const toggleAmenity = (key: string, checked: boolean) => {
    setSearchParams((prev) => {
      const has = prev.amenities.includes(key);
      if (checked && !has) {
        return { ...prev, amenities: [...prev.amenities, key] };
      }
      if (!checked && has) {
        return {
          ...prev,
          amenities: prev.amenities.filter((a) => a !== key),
        };
      }
      return prev;
    });
  };

  const togglePropertyType = (
    value: ConcretePropertyType,
    checked: boolean,
  ) => {
    setSearchParams((prev) => {
      const has = prev.propertyTypes.includes(value);
      if (checked === has) return prev;
      const propertyTypes = checked
        ? [...prev.propertyTypes, value]
        : prev.propertyTypes.filter((t) => t !== value);
      // Un subtipo de un tipo desmarcado, o habitaciones en una selección que
      // ya no las tiene (garaje, nave…), acotarían a cero sin que se viera.
      const keepRooms = selectionHasRooms(propertyTypes);
      return {
        ...prev,
        propertyTypes,
        subtypes: pruneSubtypes(prev.subtypes, propertyTypes),
        bedrooms: keepRooms ? prev.bedrooms : "any",
        bathrooms: keepRooms ? prev.bathrooms : "any",
      };
    });
  };

  const toggleSubtype = (key: string, checked: boolean) => {
    setSearchParams((prev) => ({
      ...prev,
      subtypes: checked
        ? Array.from(new Set([...prev.subtypes, key]))
        : prev.subtypes.filter((k) => k !== key),
    }));
  };

  // Filter context for the location dropdowns — makes them show only
  // provinces/cities/neighborhoods that still have matching listings given
  // the other active filters.
  const locationFilters = {
    propertyType:
      searchParams.propertyTypes.length > 0
        ? searchParams.propertyTypes
        : undefined,
    status: searchParams.status,
    bedrooms:
      searchParams.bedrooms !== "any"
        ? Number.parseInt(searchParams.bedrooms)
        : undefined,
    bathrooms:
      searchParams.bathrooms !== "any"
        ? Number.parseInt(searchParams.bathrooms)
        : undefined,
    minPrice: minPriceFilter,
    maxPrice: maxPriceFilter,
    // Los desplegables de ubicación se estrechan con TODOS los filtros; antes
    // ignoraban las características y ofrecían ciudades que daban cero.
    amenities:
      searchParams.amenities.length > 0 ? searchParams.amenities : undefined,
    subtypes:
      searchParams.subtypes.length > 0 ? searchParams.subtypes : undefined,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const {
      province,
      cities,
      neighborhoodIds,
      propertyTypes: selectedTypes,
      bedrooms,
      bathrooms,
      status,
      amenities,
      subtypes,
    } = searchParams;

    const searchParamsData: SearchParams = {
      cities: cities.length > 0 ? cities : undefined,
      neighborhoodIds: neighborhoodIds.length > 0 ? neighborhoodIds : undefined,
      province: province || undefined,
      propertyType: selectedTypes.length > 0 ? selectedTypes : undefined,
      bedrooms,
      bathrooms,
      minPrice: minPriceFilter,
      maxPrice: maxPriceFilter,
      status,
      amenities: amenities.length > 0 ? amenities : undefined,
      subtypes: subtypes.length > 0 ? subtypes : undefined,
    };

    const searchSlug = buildSearchSlug(searchParamsData);
    router.push(`/${searchSlug}`);
  };

  // Format numbers consistently to avoid hydration issues
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES").format(num);
  };

  // Account 137 gets slightly larger, dark-green search field labels (matching
  // the brand green used elsewhere on this account's site).
  const labelClass = isAccount137()
    ? "text-base font-medium text-[#14532d]"
    : "text-sm font-medium";

  return (
    <motion.div
      className="relative mx-auto max-w-5xl rounded-lg bg-background/95 p-4 shadow-lg backdrop-blur-sm sm:p-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {isAccount137() && (
        <>
          <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Inmobiliaria Ana Díaz"
                className="h-12 w-auto shrink-0 -translate-y-1.5 sm:h-14 sm:-translate-y-2 md:h-16"
              />
            )}
            <h2
              className="text-left text-3xl font-extrabold tracking-tight text-[#14532d] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Inmobiliaria Ana Díaz
            </h2>
          </div>
        </>
      )}
      <motion.form
        className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4"
        onSubmit={handleSubmit}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* First Row */}
        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="status" className={labelClass}>
            Operación
          </Label>
          <Select
            defaultValue={searchParams.status}
            onValueChange={(value) =>
              handleSelectChange("status", value as "for-sale" | "for-rent")
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Operación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="for-sale">Compra</SelectItem>
              <SelectItem value="for-rent">Alquiler</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="property-type" className={labelClass}>
            Tipo de Propiedad
          </Label>
          <PropertyTypeMenu
            id="property-type"
            types={propertyTypes}
            selectedTypes={searchParams.propertyTypes}
            onToggleType={togglePropertyType}
            subtypeOptions={subtypeOptionsFor(
              subtypeOptions,
              searchParams.status,
            )}
            selectedSubtypes={searchParams.subtypes}
            onToggleSubtype={toggleSubtype}
            placeholder="Cualquiera"
          />
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="bedrooms" className={labelClass}>
            {roomsFilterLabel(searchParams.propertyTypes)}
          </Label>
          <Select
            value={searchParams.bedrooms}
            onValueChange={(value) => handleSelectChange("bedrooms", value)}
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
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="bathrooms" className={labelClass}>
            Baños
          </Label>
          <Select
            value={searchParams.bathrooms}
            onValueChange={(value) => handleSelectChange("bathrooms", value)}
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
        </motion.div>

        {/* Second Row */}
        <motion.div className="col-span-2 space-y-2" variants={staggerItem}>
          <Label className={labelClass}>Ubicación</Label>
          <TwoLevelLocationSelect
            initialProvinces={provinces}
            accountId={accountId}
            selectedProvince={searchParams.province}
            selectedCities={searchParams.cities}
            selectedNeighborhoodIds={searchParams.neighborhoodIds}
            filters={locationFilters}
            onProvinceChange={(province) =>
              handleSelectChange("province", province)
            }
            onSelectionChange={handleLocationSelectionChange}
          />
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <Label className={labelClass}>Precio</Label>
            <span className="text-center text-xs text-muted-foreground sm:text-right">
              {formatNumber(priceRange[0] ?? 0)}€ -{" "}
              {formatNumber(priceRange[1] ?? 0)}€
            </span>
          </div>
          <Slider
            value={priceRange}
            min={bounds.minPrice}
            max={bounds.maxPrice}
            step={searchParams.status === "for-rent" ? 50 : 5000}
            onValueChange={setPriceRange}
            className="py-4"
          />
        </motion.div>

        <motion.div className="flex items-end" variants={staggerItem}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button
              type="submit"
              size="lg"
              className={`w-full ${isAccount137() ? "!bg-[#14532d] !text-white hover:!bg-[#14532d]/90" : ""}`}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="col-span-2 md:col-span-4" variants={staggerItem}>
          <CharacteristicsFilter
            selected={searchParams.amenities}
            onToggle={toggleAmenity}
          />
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
