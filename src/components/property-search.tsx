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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Slider } from "~/components/ui/slider";
import { Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AMENITY_FILTERS,
  buildSearchSlug,
  PROPERTY_TYPE_LABEL,
  type PropertyType,
  type SearchParams,
} from "~/lib/search-utils";
import { Checkbox } from "~/components/ui/checkbox";
import { TwoLevelLocationSelect } from "~/components/ui/two-level-location-select";
import { staggerContainer, staggerItem } from "~/lib/animations";
import { isAccount137 } from "~/lib/account-overrides/137";

type ConcretePropertyType = Exclude<PropertyType, "any">;

interface SearchFormData {
  province: string;
  cities: string[];
  neighborhoodIds: string[];
  propertyTypes: ConcretePropertyType[];
  bedrooms: string;
  bathrooms: string;
  status: "for-sale" | "for-rent";
  amenities: string[];
}

interface PropertySearchProps {
  provinces: string[];
  propertyTypes: string[];
  priceRange: { minPrice: number; maxPrice: number };
  accountId: string;
  logoUrl?: string | null;
}

export function PropertySearch({
  provinces,
  propertyTypes,
  priceRange: dbPriceRange,
  accountId,
  logoUrl,
}: PropertySearchProps) {
  const router = useRouter();
  const [priceRange, setPriceRange] = useState<number[]>([
    dbPriceRange.minPrice || 50000,
    dbPriceRange.maxPrice || 1000000,
  ]);
  const [isPriceSliderTouched, setIsPriceSliderTouched] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    province: "",
    cities: [],
    neighborhoodIds: [],
    propertyTypes: [],
    bedrooms: "any",
    bathrooms: "any",
    status: "for-sale",
    amenities: [],
  });
  // Account-137 "Ver más" expandable extra-characteristics panel.
  const [showMoreFilters, setShowMoreFilters] = useState(false);

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
  };

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
      if (checked && !has) {
        return { ...prev, propertyTypes: [...prev.propertyTypes, value] };
      }
      if (!checked && has) {
        return {
          ...prev,
          propertyTypes: prev.propertyTypes.filter((t) => t !== value),
        };
      }
      return prev;
    });
  };

  const propertyTypeButtonLabel = (() => {
    const sel = searchParams.propertyTypes;
    if (sel.length === 0) return "Cualquiera";
    if (sel.length === 1) {
      const t = sel[0]!;
      return (
        (isAccount137() || t === "industrial"
          ? PROPERTY_TYPE_LABEL[t]
          : undefined) ?? t.charAt(0).toUpperCase() + t.slice(1)
      );
    }
    return `${sel.length} tipos`;
  })();

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
    minPrice: isPriceSliderTouched ? (priceRange[0] ?? 0) : undefined,
    maxPrice: isPriceSliderTouched ? (priceRange[1] ?? 0) : undefined,
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
    } = searchParams;

    const searchParamsData: SearchParams = {
      cities: cities.length > 0 ? cities : undefined,
      neighborhoodIds: neighborhoodIds.length > 0 ? neighborhoodIds : undefined,
      province: province || undefined,
      propertyType: selectedTypes.length > 0 ? selectedTypes : undefined,
      bedrooms,
      bathrooms,
      minPrice: isPriceSliderTouched ? (priceRange[0] ?? 0) : undefined,
      maxPrice: isPriceSliderTouched ? (priceRange[1] ?? 0) : undefined,
      status,
      amenities: amenities.length > 0 ? amenities : undefined,
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id="property-type"
                type="button"
                variant="outline"
                className="flex h-10 w-full items-center justify-between px-3 font-normal"
              >
                <span
                  className={
                    searchParams.propertyTypes.length === 0
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
                    checked={searchParams.propertyTypes.includes(value)}
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
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="bedrooms" className={labelClass}>
            Habitaciones
          </Label>
          <Select
            defaultValue={searchParams.bedrooms}
            onValueChange={(value) => handleSelectChange("bedrooms", value)}
          >
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
        </motion.div>

        <motion.div className="space-y-2" variants={staggerItem}>
          <Label htmlFor="bathrooms" className={labelClass}>
            Baños
          </Label>
          <Select
            defaultValue={searchParams.bathrooms}
            onValueChange={(value) => handleSelectChange("bathrooms", value)}
          >
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
            defaultValue={priceRange}
            min={dbPriceRange.minPrice || 0}
            max={dbPriceRange.maxPrice || 2000000}
            step={10000}
            onValueChange={(value) => {
              setPriceRange(value);
              setIsPriceSliderTouched(true);
            }}
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

        {/* Chevron toggle reveals extra characteristic filters (all accounts). */}
        <motion.div
          className="col-span-2 flex flex-col items-center md:col-span-4"
          variants={staggerItem}
        >
          <button
            type="button"
            onClick={() => setShowMoreFilters((v) => !v)}
            aria-expanded={showMoreFilters}
            aria-label={
              showMoreFilters
                ? "Ocultar más características"
                : "Mostrar más características"
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${showMoreFilters ? "rotate-180" : ""}`}
            />
          </button>
          {showMoreFilters && (
            <div className="mt-3 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {AMENITY_FILTERS.map((amenity) => (
                <label
                  key={amenity.key}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={searchParams.amenities.includes(amenity.key)}
                    onCheckedChange={(checked) =>
                      toggleAmenity(amenity.key, checked === true)
                    }
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          )}
        </motion.div>
      </motion.form>
    </motion.div>
  );
}
