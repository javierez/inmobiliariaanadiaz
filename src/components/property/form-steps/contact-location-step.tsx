"use client";

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AddressAutocomplete,
  parseSubpremise,
  type LocationData,
} from "~/components/property/address-autocomplete";
import type { ContactInfo, LocationInfo } from "~/types/property-form";

interface ContactLocationStepProps {
  contactData: ContactInfo;
  locationData: LocationInfo;
  updateContact: (data: Partial<ContactInfo>) => void;
  updateLocation: (data: Partial<LocationInfo>) => void;
  errors: Record<string, string>;
}

const provincias = [
  "Álava",
  "Albacete",
  "Alicante",
  "Almería",
  "Asturias",
  "Ávila",
  "Badajoz",
  "Baleares",
  "Barcelona",
  "Burgos",
  "Cáceres",
  "Cádiz",
  "Cantabria",
  "Castellón",
  "Ciudad Real",
  "Córdoba",
  "Cuenca",
  "Girona",
  "Granada",
  "Guadalajara",
  "Guipúzcoa",
  "Huelva",
  "Huesca",
  "Jaén",
  "La Coruña",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lérida",
  "Lugo",
  "Madrid",
  "Málaga",
  "Murcia",
  "Navarra",
  "Ourense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz de Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valencia",
  "Valladolid",
  "Vizcaya",
  "Zamora",
  "Zaragoza",
];

function matchProvincia(googleProvince: string): string {
  if (provincias.includes(googleProvince)) return googleProvince;
  const lower = googleProvince.toLowerCase();
  const found = provincias.find((p) => p.toLowerCase() === lower);
  if (found) return found;
  const partial = provincias.find(
    (p) => lower.includes(p.toLowerCase()) || p.toLowerCase().includes(lower),
  );
  return partial ?? "";
}

export function ContactLocationStep({
  contactData,
  locationData,
  updateContact,
  updateLocation,
  errors,
}: ContactLocationStepProps) {
  const handleLocationSelected = (location: LocationData) => {
    const { components } = location;
    const subpremise = parseSubpremise(components.subpremise);

    updateLocation({
      direccion: components.route,
      numero: components.streetNumber,
      planta: subpremise.floor ?? locationData.planta,
      puerta: subpremise.door ?? locationData.puerta,
      codigoPostal: components.postalCode || locationData.codigoPostal,
      localidad: components.locality || locationData.localidad,
      provincia: matchProvincia(components.province) || locationData.provincia,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Contacto y localización</h2>
        <p className="text-muted-foreground">
          Tus datos y la dirección del inmueble. Es lo único que necesitamos
          para empezar.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={contactData.nombre}
              onChange={(e) => updateContact({ nombre: e.target.value })}
              placeholder="Tu nombre"
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email{" "}
              <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={contactData.email}
              onChange={(e) => updateContact({ email: e.target.value })}
              placeholder="tu@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">
              Teléfono <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefono"
              value={contactData.telefono}
              onChange={(e) => updateContact({ telefono: e.target.value })}
              placeholder="Tu teléfono"
              className={errors.telefono ? "border-red-500" : ""}
            />
            {errors.telefono && (
              <p className="text-sm text-red-500">{errors.telefono}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion">
            Dirección <span className="text-red-500">*</span>
          </Label>
          <AddressAutocomplete
            value={locationData.direccion}
            onChange={(value) => updateLocation({ direccion: value })}
            onLocationSelected={handleLocationSelected}
            placeholder="Buscar dirección..."
            hasError={!!errors.direccion}
          />
          {errors.direccion && (
            <p className="text-sm text-red-500">{errors.direccion}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="codigoPostal">
              Código postal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="codigoPostal"
              value={locationData.codigoPostal}
              onChange={(e) => updateLocation({ codigoPostal: e.target.value })}
              placeholder="CP"
              className={errors.codigoPostal ? "border-red-500" : ""}
            />
            {errors.codigoPostal && (
              <p className="text-sm text-red-500">{errors.codigoPostal}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="localidad">
              Localidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="localidad"
              value={locationData.localidad}
              onChange={(e) => updateLocation({ localidad: e.target.value })}
              placeholder="Localidad"
              className={errors.localidad ? "border-red-500" : ""}
            />
            {errors.localidad && (
              <p className="text-sm text-red-500">{errors.localidad}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="provincia">Provincia</Label>
            <Select
              value={locationData.provincia}
              onValueChange={(value) => updateLocation({ provincia: value })}
            >
              <SelectTrigger id="provincia">
                <SelectValue placeholder="Provincia" />
              </SelectTrigger>
              <SelectContent>
                {provincias.map((provincia) => (
                  <SelectItem key={provincia} value={provincia}>
                    {provincia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
