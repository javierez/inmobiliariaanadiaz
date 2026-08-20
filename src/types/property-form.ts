export type PropertyType = "piso" | "casa" | "local" | "solar" | "garaje";

export interface ContactInfo {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
}

export interface LocationInfo {
  direccion: string;
  numero: string;
  planta: string;
  puerta: string;
  codigoPostal: string;
  localidad: string;
  provincia: string;
}

export interface PropertyInfo {
  tipo: PropertyType;
  superficie: string;
  habitaciones: string;
  banos: string;
  descripcion: string;
  caracteristicas: string[];
}

export interface EconomicInfo {
  precioVenta: string;
  precioAlquiler: string;
  gastosComunitarios: string;
  ibi: string;
}

export interface PropertyFormData {
  contactInfo: ContactInfo;
  locationInfo: LocationInfo;
  propertyInfo: PropertyInfo;
  economicInfo: EconomicInfo;
  images: File[];
  acceptTerms: boolean;
  honeypot?: string;
}

export type FormStep =
  | "contact"
  | "location"
  | "property"
  | "economic"
  | "images"
  | "review";

export interface ContactLeadData {
  nombre: string;
  email: string;
  telefono: string;
  acceptTerms: boolean;
  honeypot?: string;
}
