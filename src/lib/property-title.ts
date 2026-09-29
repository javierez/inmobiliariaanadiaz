/**
 * Property Title Generation Utility
 *
 * Generates property titles in the format: {PropertyType} en {Street} ({Neighborhood})
 * Example: "Piso en Calle Mayor (Centro)"
 */

export function generatePropertyTitle(
  propertyType: string,
  street = "",
  neighborhood = "",
) {
  const getPropertyTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case "piso":
        return "Piso";
      case "casa":
        return "Casa";
      case "local":
        return "Local";
      case "solar":
        return "Terreno";
      case "garaje":
        return "Garaje";
      case "apartamento":
        return "Apartamento";
      case "chalet":
        return "Chalet";
      case "duplex":
        return "Dúplex";
      case "estudio":
        return "Estudio";
      case "oficina":
        return "Oficina";
      default:
        return type;
    }
  };

  const type = getPropertyTypeText(propertyType);
  const streetText = street.trim();
  const neighborhoodText = neighborhood ? `(${neighborhood.trim()})` : "";

  if (!streetText) {
    // Fallback if no street is provided
    return neighborhoodText ? `${type} ${neighborhoodText}` : type;
  }

  return `${type} en ${streetText} ${neighborhoodText}`.trim();
}

/**
 * Property type mapping for validation
 */
export const PROPERTY_TYPES = {
  piso: "Piso",
  casa: "Casa",
  local: "Local",
  solar: "Terreno",
  garaje: "Garaje",
  apartamento: "Apartamento",
  chalet: "Chalet",
  duplex: "Dúplex",
  estudio: "Estudio",
  oficina: "Oficina",
} as const;

export type PropertyType = keyof typeof PROPERTY_TYPES;

/**
 * Validates if a property type is supported
 */
export function isValidPropertyType(type: string): type is PropertyType {
  return type.toLowerCase() in PROPERTY_TYPES;
}
