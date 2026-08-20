"use client";

import { useState } from "react";
import {
  Check,
  ArrowUp,
  Thermometer,
  Shield,
  Home as HomeIcon,
  Lock,
  Hammer,
  Snowflake,
  Car as CarIcon,
  Building,
  Sun,
  TreePine as TreeIcon,
  Waves as WavesIcon,
  Zap,
  Dumbbell,
  WashingMachine,
  Bath as BathIcon,
  Baby,
  Heart,
  Utensils,
  Wifi,
  ChefHat,
  Microwave,
  Refrigerator,
  Tv,
  Eye,
  TreePine,
  Waves,
  Bus,
  Music,
  Flame,
  X,
  ChevronDown,
  ChevronUp,
  Box,
  Video,
  UserCheck,
  Accessibility,
  Square,
  Satellite,
  Archive,
  Cookie,
  Sofa,
  Wine,
  Shirt,
  Droplet,
  PersonStanding,
  Circle,
  Palmtree,
} from "lucide-react";
import { isAccount137 } from "~/lib/account-overrides/137";
import { PROPERTY_TYPE_LABEL, type PropertyType } from "~/lib/search-utils";

interface PropertyCharacteristicsProps {
  property: any;
}

/**
 * Human label for a stored propertyType. Account 137 mirrors the header search
 * dropdown (PROPERTY_TYPE_LABEL — e.g. industrial → "Nave"). Every other account
 * keeps the original behavior: five known types mapped, raw value otherwise.
 */
function propertyTypeLabel(raw: unknown): string {
  const t = typeof raw === "string" ? raw : "";
  if (!t) return "";
  if (isAccount137()) {
    return (
      PROPERTY_TYPE_LABEL[t as Exclude<PropertyType, "any">] ??
      t.charAt(0).toUpperCase() + t.slice(1)
    );
  }
  const legacy: Record<string, string> = {
    piso: "Piso",
    casa: "Casa",
    local: "Local",
    solar: "Terreno",
    garaje: "Garaje",
  };
  return legacy[t] ?? t;
}

/** Returns true if the value is meaningful (not null/undefined/empty/Sin_especificar/0) */
function hasValue(val: unknown): boolean {
  if (val == null || val === "" || val === 0 || val === "0") return false;
  if (
    typeof val === "string" &&
    val.toLowerCase().replace(/[_\s]/g, "") === "sinespecificar"
  )
    return false;
  return true;
}

export function PropertyCharacteristics({
  property,
}: PropertyCharacteristicsProps) {
  const [showAllCharacteristics, setShowAllCharacteristics] = useState(false);

  // Land plots (solares) don't have building-specific characteristics
  const isLand = property.propertyType === "solar";

  // Check if there's any additional content to show beyond the always-visible sections
  const hasMoreCharacteristics = !!(
    // Building Features
    (
      (!isLand &&
        (hasValue(property.buildingFloors) ||
          hasValue(property.orientation) ||
          hasValue(property.mainFloorType) ||
          hasValue(property.windowType) ||
          hasValue(property.shutterType) ||
          hasValue(property.carpentryType) ||
          property.doubleGlazing ||
          property.disabledAccessible ||
          property.satelliteDish)) ||
      // Kitchen Features
      (!isLand &&
        (hasValue(property.kitchenType) ||
          property.openKitchen ||
          property.furnishedKitchen ||
          property.pantry)) ||
      // Climate Control
      (!isLand &&
        (hasValue(property.heatingType) ||
          hasValue(property.hotWaterType) ||
          hasValue(property.airConditioningType))) ||
      // Garage Details
      (!isLand &&
        property.hasGarage &&
        (hasValue(property.garageType) ||
          hasValue(property.garageSpaces) ||
          hasValue(property.garageNumber))) ||
      // Additional Spaces
      (!isLand &&
        (hasValue(property.terraceSize) ||
          property.wineCellar ||
          property.builtInWardrobes ||
          hasValue(property.wineCellarSize) ||
          hasValue(property.livingRoomSize) ||
          hasValue(property.balconyCount) ||
          hasValue(property.galleryCount) ||
          hasValue(property.storageRoomSize))) ||
      // Luxury & Recreation
      property.jacuzzi ||
      property.hydromassage ||
      property.gym ||
      property.sportsArea ||
      property.communityPool ||
      property.privatePool ||
      property.tennisCourt ||
      property.childrenArea ||
      property.musicSystem ||
      property.homeAutomation ||
      // Views and Location
      property.views ||
      property.mountainViews ||
      property.seaViews ||
      property.beachfront ||
      property.nearbyPublicTransport ||
      // Appliances
      (!isLand &&
        (property.internet ||
          property.oven ||
          property.microwave ||
          property.washingMachine ||
          property.fridge ||
          property.tv ||
          property.stoneware)) ||
      // Construction Status
      (!isLand &&
        (property.brandNew ||
          property.newConstruction ||
          property.underConstruction ||
          property.needsRenovation ||
          property.lastRenovationYear)) ||
      // Rental Features
      ((property.listingType === "Rent" ||
        property.listingType === "RentWithOption") &&
        (property.isFurnished ||
          hasValue(property.furnitureQuality) ||
          property.studentFriendly ||
          property.petsAllowed ||
          property.appliancesIncluded ||
          (property.optionalGarage && property.optionalGaragePrice) ||
          (property.optionalStorageRoom && property.optionalStorageRoomPrice)))
    )
  );

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Características</h2>
      <div className="space-y-6">
        {/* Basic Information - Only show if there's data to display */}
        {(hasValue(property.propertyType) ||
          hasValue(property.builtSurfaceArea) ||
          hasValue(property.yearBuilt) ||
          hasValue(property.conservationStatus)) && (
          <div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Reference intentionally omitted here — it already appears in the
                  property header, so showing it again would be redundant. */}
              {hasValue(property.propertyType) && (
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="font-medium">Tipo de inmueble</span>
                  <span className="text-sm">
                    {typeof property.propertySubtype === "string" &&
                    property.propertySubtype.trim()
                      ? propertyTypeLabel(property.propertySubtype)
                      : propertyTypeLabel(property.propertyType)}
                  </span>
                </div>
              )}
              {/* On land this column holds the PLOT, not a built surface —
                  labelling a bare solar "Superficie construida" advertises a
                  building that isn't there. */}
              {hasValue(property.builtSurfaceArea) &&
                Number(property.builtSurfaceArea) > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span className="font-medium">
                      {isLand
                        ? "Superficie de parcela"
                        : "Superficie construida"}
                    </span>
                    <span className="text-sm">
                      {Number(property.builtSurfaceArea).toLocaleString()} m²
                    </span>
                  </div>
                )}
              {/* NOTE: no "Superficie edificable" row. `property.squareMeter`
                  has already been through resolveSquareMeter() in the query, so
                  on land it holds the PLOT — printing it would repeat the row
                  above. */}
              {!isLand && hasValue(property.yearBuilt) && (
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="font-medium">Año construcción</span>
                  <span className="text-sm">{property.yearBuilt}</span>
                </div>
              )}
              {!isLand &&
                hasValue(property.conservationStatus) &&
                [1, 2, 3, 4, 6].includes(
                  Number(property.conservationStatus),
                ) && (
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span className="font-medium">Estado conservación</span>
                    <span className="text-sm">
                      {property.conservationStatus === 1
                        ? "Bueno"
                        : property.conservationStatus === 2
                          ? "Muy bueno"
                          : property.conservationStatus === 3
                            ? "Como nuevo"
                            : property.conservationStatus === 4
                              ? "A reformar"
                              : "Reformado"}
                    </span>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Essential Features - Only show if there are features */}
        {!!(
          (!isLand &&
            (property.hasElevator ||
              property.hasGarage ||
              property.hasStorageRoom ||
              property.hasHeating ||
              hasValue(property.airConditioningType) ||
              property.isFittedOut === true ||
              property.terrace ||
              property.bright ||
              property.exterior)) ||
          property.garden ||
          property.pool
        ) && (
          <div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {!isLand && !!property.hasElevator && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <ArrowUp className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Ascensor
                  </span>
                </div>
              )}
              {!isLand && !!property.hasGarage && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <CarIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Garaje
                  </span>
                </div>
              )}
              {!isLand && !!property.hasStorageRoom && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Box className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Trastero
                  </span>
                </div>
              )}
              {!isLand && !!property.hasHeating && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Thermometer className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Calefacción
                  </span>
                </div>
              )}
              {!isLand && hasValue(property.airConditioningType) && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Snowflake className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Aire Acondicionado
                  </span>
                </div>
              )}
              {!isLand && property.isFittedOut === true && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Hammer className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Acondicionado
                  </span>
                </div>
              )}
              {!isLand && !!property.terrace && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Sun className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Terraza
                  </span>
                </div>
              )}
              {!!property.garden && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <TreeIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Jardín
                  </span>
                </div>
              )}
              {!!property.pool && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <WavesIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Piscina
                  </span>
                </div>
              )}
              {!isLand && !!property.bright && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Sun className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Luminoso
                  </span>
                </div>
              )}
              {!isLand && !!property.exterior && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Exterior
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional characteristics - Always show */}
        <div className="space-y-6">
          {/* Security Features - Only show if has security features (not for land) */}
          {!isLand &&
            !!(
              property.alarm ||
              property.securityDoor ||
              property.videoIntercom ||
              property.conciergeService ||
              property.securityGuard
            ) && (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Shield className="h-5 w-5 text-primary" />
                  Seguridad
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {!!property.alarm && (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <Shield className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Alarma
                      </span>
                    </div>
                  )}
                  {!!property.securityDoor && (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <Lock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Puerta Blindada
                      </span>
                    </div>
                  )}
                  {!!property.videoIntercom && (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <Video className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Videoportero
                      </span>
                    </div>
                  )}
                  {!!property.conciergeService && (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <UserCheck className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Conserjería
                      </span>
                    </div>
                  )}
                  {!!property.securityGuard && (
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <Shield className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Vigilancia
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Toggle button for additional characteristics - only show if there's more to reveal */}
          {hasMoreCharacteristics && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() =>
                  setShowAllCharacteristics(!showAllCharacteristics)
                }
                className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>
                  {showAllCharacteristics
                    ? "Mostrar menos"
                    : "Ver más características"}
                </span>
                {showAllCharacteristics ? (
                  <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                ) : (
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                )}
              </button>
            </div>
          )}

          {/* Additional characteristics - Hidden by default */}
          {showAllCharacteristics && hasMoreCharacteristics && (
            <>
              {/* Building Features - Only show if has building features (not for land) */}
              {!isLand &&
                !!(
                  hasValue(property.buildingFloors) ||
                  hasValue(property.orientation) ||
                  hasValue(property.mainFloorType) ||
                  hasValue(property.windowType) ||
                  hasValue(property.shutterType) ||
                  hasValue(property.carpentryType) ||
                  property.doubleGlazing ||
                  property.disabledAccessible ||
                  property.satelliteDish
                ) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Building className="h-5 w-5 text-primary" />
                      Características del Edificio
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {hasValue(property.buildingFloors) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">
                            Plantas del edificio
                          </span>
                          <span className="text-sm">
                            {property.buildingFloors}
                          </span>
                        </div>
                      )}
                      {hasValue(property.orientation) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Orientación</span>
                          <span className="text-sm">
                            {property.orientation
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                      {hasValue(property.mainFloorType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tipo de suelo</span>
                          <span className="text-sm">
                            {property.mainFloorType
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                      {hasValue(property.windowType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tipo de ventanas</span>
                          <span className="text-sm">
                            {property.windowType
                              .split(" ")
                              .map((word: string) =>
                                word.toUpperCase() === "PVC"
                                  ? "PVC"
                                  : word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                      {hasValue(property.shutterType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tipo de persianas</span>
                          <span className="text-sm">
                            {property.shutterType
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                      {hasValue(property.carpentryType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Carpintería</span>
                          <span className="text-sm">
                            {property.carpentryType
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {!!property.doubleGlazing && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Square className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Doble Cristal
                          </span>
                        </div>
                      )}
                      {!!property.disabledAccessible && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Accessibility className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Accesible
                          </span>
                        </div>
                      )}
                      {!!property.satelliteDish && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Satellite className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Antena Parabólica
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Kitchen Features (not for land) */}
              {!isLand &&
                !!(
                  hasValue(property.kitchenType) ||
                  property.openKitchen ||
                  property.furnishedKitchen ||
                  property.pantry
                ) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <ChefHat className="h-5 w-5 text-primary" />
                      Cocina
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {hasValue(property.kitchenType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tipo de cocina</span>
                          <span className="text-sm">
                            {property.kitchenType
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {!!property.openKitchen && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <ChefHat className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Cocina Abierta
                          </span>
                        </div>
                      )}
                      {!!property.furnishedKitchen && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Sofa className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Cocina Amueblada
                          </span>
                        </div>
                      )}
                      {!!property.pantry && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Cookie className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Despensa
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Climate Control (not for land) */}
              {!isLand &&
                (hasValue(property.heatingType) ||
                  hasValue(property.hotWaterType) ||
                  hasValue(property.airConditioningType)) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Thermometer className="h-5 w-5 text-primary" />
                      Climatización
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {hasValue(property.heatingType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">
                            Tipo de calefacción
                          </span>
                          <span className="text-sm">
                            {property.heatingType}
                          </span>
                        </div>
                      )}
                      {hasValue(property.hotWaterType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Agua caliente</span>
                          <span className="text-sm">
                            {property.hotWaterType}
                          </span>
                        </div>
                      )}
                      {hasValue(property.airConditioningType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">
                            Aire acondicionado
                          </span>
                          <span className="text-sm">
                            {property.airConditioningType
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Garage Details (not for land) */}
              {!isLand &&
                !!property.hasGarage &&
                (hasValue(property.garageType) ||
                  hasValue(property.garageSpaces) ||
                  hasValue(property.garageNumber)) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <CarIcon className="h-5 w-5 text-primary" />
                      Garaje
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {hasValue(property.garageType) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tipo de garaje</span>
                          <span className="text-sm">
                            {property.garageType
                              .split(" ")
                              .map(
                                (word: string) =>
                                  word.charAt(0).toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                          </span>
                        </div>
                      )}
                      {hasValue(property.garageSpaces) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Plazas</span>
                          <span className="text-sm">
                            {property.garageSpaces}
                          </span>
                        </div>
                      )}
                      {hasValue(property.garageNumber) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Número</span>
                          <span className="text-sm">
                            {property.garageNumber}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {!!property.garageInBuilding && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Building className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            En Edificio
                          </span>
                        </div>
                      )}
                      {!!property.elevatorToGarage && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <ArrowUp className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Ascensor a Garaje
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Additional Spaces (not for land) */}
              {!isLand &&
                !!(
                  hasValue(property.terraceSize) ||
                  property.wineCellar ||
                  property.builtInWardrobes ||
                  hasValue(property.wineCellarSize) ||
                  hasValue(property.livingRoomSize) ||
                  hasValue(property.balconyCount) ||
                  hasValue(property.galleryCount) ||
                  hasValue(property.storageRoomSize)
                ) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Building className="h-5 w-5 text-primary" />
                      Espacios Adicionales
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {hasValue(property.terraceSize) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tamaño terraza</span>
                          <span className="text-sm">
                            {property.terraceSize} m²
                          </span>
                        </div>
                      )}
                      {hasValue(property.livingRoomSize) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tamaño salón</span>
                          <span className="text-sm">
                            {property.livingRoomSize} m²
                          </span>
                        </div>
                      )}
                      {hasValue(property.storageRoomSize) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tamaño trastero</span>
                          <span className="text-sm">
                            {property.storageRoomSize} m²
                          </span>
                        </div>
                      )}
                      {hasValue(property.wineCellarSize) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Tamaño bodega</span>
                          <span className="text-sm">
                            {property.wineCellarSize} m²
                          </span>
                        </div>
                      )}
                      {hasValue(property.balconyCount) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Balcones</span>
                          <span className="text-sm">
                            {property.balconyCount}
                          </span>
                        </div>
                      )}
                      {hasValue(property.galleryCount) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Galerías</span>
                          <span className="text-sm">
                            {property.galleryCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {!!property.builtInWardrobes && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Archive className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Armarios Empotr.
                          </span>
                        </div>
                      )}
                      {!!property.wineCellar && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Wine className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Bodega
                          </span>
                        </div>
                      )}
                      {!!property.laundryRoom && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <WashingMachine className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Lavadero
                          </span>
                        </div>
                      )}
                      {!!property.coveredClothesline && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Shirt className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Tendedero Cubierto
                          </span>
                        </div>
                      )}
                      {!!property.fireplace && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Flame className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Chimenea
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Luxury & Recreation */}
              {!!(
                property.jacuzzi ||
                property.hydromassage ||
                property.gym ||
                property.sportsArea ||
                property.communityPool ||
                property.privatePool ||
                property.tennisCourt ||
                property.childrenArea ||
                property.musicSystem ||
                property.homeAutomation
              ) && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Heart className="h-5 w-5 text-primary" />
                    Lujo y Recreación
                  </h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {!!property.jacuzzi && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <WavesIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Jacuzzi
                        </span>
                      </div>
                    )}
                    {!!property.hydromassage && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Droplet className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Hidromasaje
                        </span>
                      </div>
                    )}
                    {!!property.gym && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Dumbbell className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Gimnasio
                        </span>
                      </div>
                    )}
                    {!!property.sportsArea && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <PersonStanding className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Zona Deportiva
                        </span>
                      </div>
                    )}
                    {!!property.communityPool && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <WavesIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Piscina Comunitaria
                        </span>
                      </div>
                    )}
                    {!!property.privatePool && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <WavesIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Piscina Privada
                        </span>
                      </div>
                    )}
                    {!!property.tennisCourt && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Circle className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Pista de Tenis
                        </span>
                      </div>
                    )}
                    {!!property.childrenArea && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Baby className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Zona Infantil
                        </span>
                      </div>
                    )}
                    {!!property.musicSystem && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Music className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Sistema Musical
                        </span>
                      </div>
                    )}
                    {!!property.homeAutomation && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Zap className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Domótica
                        </span>
                      </div>
                    )}
                    {!!property.suiteBathroom && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <BathIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Baño en Suite
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Views and Location */}
              {!!(
                property.views ||
                property.mountainViews ||
                property.seaViews ||
                property.beachfront ||
                property.nearbyPublicTransport
              ) && (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Eye className="h-5 w-5 text-primary" />
                    Vistas y Ubicación
                  </h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {!!property.views && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Eye className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Buenas Vistas
                        </span>
                      </div>
                    )}
                    {!!property.mountainViews && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <TreePine className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Vista Montaña
                        </span>
                      </div>
                    )}
                    {!!property.seaViews && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Waves className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Vista al Mar
                        </span>
                      </div>
                    )}
                    {!!property.beachfront && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Palmtree className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Primera Línea
                        </span>
                      </div>
                    )}
                    {!!property.nearbyPublicTransport && (
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <Bus className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Transporte Público
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Appliances (not for land) */}
              {!isLand &&
                !!(
                  property.internet ||
                  property.oven ||
                  property.microwave ||
                  property.washingMachine ||
                  property.fridge ||
                  property.tv ||
                  property.stoneware
                ) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Utensils className="h-5 w-5 text-primary" />
                      Electrodomésticos
                    </h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {!!property.internet && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Wifi className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Internet
                          </span>
                        </div>
                      )}
                      {!!property.oven && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <ChefHat className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Horno
                          </span>
                        </div>
                      )}
                      {!!property.microwave && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Microwave className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Microondas
                          </span>
                        </div>
                      )}
                      {!!property.washingMachine && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <WashingMachine className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Lavadora
                          </span>
                        </div>
                      )}
                      {!!property.fridge && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Refrigerator className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Nevera
                          </span>
                        </div>
                      )}
                      {!!property.tv && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Tv className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Televisión
                          </span>
                        </div>
                      )}
                      {!!property.stoneware && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Utensils className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Vajilla
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Construction Status (not for land) */}
              {!isLand &&
                !!(
                  property.brandNew ||
                  property.newConstruction ||
                  property.underConstruction ||
                  property.needsRenovation ||
                  property.lastRenovationYear
                ) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <Building className="h-5 w-5 text-primary" />
                      Estado de Construcción
                    </h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {!!property.brandNew && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Check className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            A Estrenar
                          </span>
                        </div>
                      )}
                      {!!property.newConstruction && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Building className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Obra Nueva
                          </span>
                        </div>
                      )}
                      {!!property.underConstruction && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Building className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            En Construcción
                          </span>
                        </div>
                      )}
                      {!!property.needsRenovation && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <X className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Necesita Reforma
                          </span>
                        </div>
                      )}
                      {!!property.lastRenovationYear && (
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                          <Check className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Reformado en {property.lastRenovationYear}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Rental Features - Show only for rental properties and only if there are features to show */}
              {(property.listingType === "Rent" ||
                property.listingType === "RentWithOption") &&
                !!(
                  property.isFurnished ||
                  hasValue(property.furnitureQuality) ||
                  property.studentFriendly ||
                  property.petsAllowed ||
                  property.appliancesIncluded ||
                  (property.optionalGarage && property.optionalGaragePrice) ||
                  (property.optionalStorageRoom &&
                    property.optionalStorageRoomPrice)
                ) && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <HomeIcon className="h-5 w-5 text-primary" />
                      Condiciones de Alquiler
                    </h3>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {!!property.isFurnished && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Amueblado</span>
                          <span className="text-sm">Sí</span>
                        </div>
                      )}
                      {hasValue(property.furnitureQuality) && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">
                            Calidad mobiliario
                          </span>
                          <span className="text-sm">
                            {property.furnitureQuality}
                          </span>
                        </div>
                      )}
                      {!!property.studentFriendly && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">
                            Admite estudiantes
                          </span>
                          <span className="text-sm">Sí</span>
                        </div>
                      )}
                      {!!property.petsAllowed && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">Admite mascotas</span>
                          <span className="text-sm">Sí</span>
                        </div>
                      )}
                      {!!property.appliancesIncluded && (
                        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                          <span className="font-medium">
                            Electrodomésticos incluidos
                          </span>
                          <span className="text-sm">Sí</span>
                        </div>
                      )}
                      {!!property.optionalGarage &&
                        !!property.optionalGaragePrice && (
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <span className="font-medium">Garaje opcional</span>
                            <span className="text-sm">
                              {Number(
                                property.optionalGaragePrice,
                              ).toLocaleString()}
                              €/mes
                            </span>
                          </div>
                        )}
                      {!!property.optionalStorageRoom &&
                        !!property.optionalStorageRoomPrice && (
                          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <span className="font-medium">
                              Trastero opcional
                            </span>
                            <span className="text-sm">
                              {Number(
                                property.optionalStorageRoomPrice,
                              ).toLocaleString()}
                              €/mes
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
