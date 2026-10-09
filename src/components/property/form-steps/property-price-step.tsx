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
import type {
  EconomicInfo,
  PropertyInfo,
  PropertyType,
} from "~/types/property-form";

interface PropertyPriceStepProps {
  propertyData: PropertyInfo;
  economicData: EconomicInfo;
  updateProperty: (data: Partial<PropertyInfo>) => void;
  updateEconomic: (data: Partial<EconomicInfo>) => void;
  errors: Record<string, string>;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: "piso", label: "Piso" },
  { value: "casa", label: "Casa" },
  { value: "local", label: "Local" },
  { value: "solar", label: "Terreno" },
  { value: "garaje", label: "Garaje" },
];

export function PropertyPriceStep({
  propertyData,
  economicData,
  updateProperty,
  updateEconomic,
  errors,
}: PropertyPriceStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Datos y precio</h2>
        <p className="text-muted-foreground">
          Solo lo esencial. Nuestro equipo afinará el resto contigo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de propiedad</Label>
          <Select
            value={propertyData.tipo}
            onValueChange={(value: PropertyType) =>
              updateProperty({ tipo: value })
            }
          >
            <SelectTrigger id="tipo">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="superficie">
            Superficie (m²) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="superficie"
            type="number"
            value={propertyData.superficie}
            onChange={(e) => updateProperty({ superficie: e.target.value })}
            placeholder="m²"
            className={errors.superficie ? "border-red-500" : ""}
          />
          {errors.superficie && (
            <p className="text-sm text-red-500">{errors.superficie}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="precio">
            Precio (€) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="precio"
            type="number"
            value={economicData.precioVenta}
            onChange={(e) => updateEconomic({ precioVenta: e.target.value })}
            placeholder="Precio de venta"
            className={errors.precioVenta ? "border-red-500" : ""}
          />
          {errors.precioVenta && (
            <p className="text-sm text-red-500">{errors.precioVenta}</p>
          )}
        </div>
      </div>
    </div>
  );
}
