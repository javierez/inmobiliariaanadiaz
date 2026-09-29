import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import Link from "next/link";
import type { PropertyFormData } from "~/types/property-form";

interface ReviewStepProps {
  data: PropertyFormData;
  updateTerms: (acceptTerms: boolean) => void;
  errors: Record<string, string>;
}

const propertyTypeLabels: Record<string, string> = {
  piso: "Piso",
  casa: "Casa",
  local: "Local",
  solar: "Terreno",
  garaje: "Garaje",
};

export function ReviewStep({ data, updateTerms, errors }: ReviewStepProps) {
  const fullName = [data.contactInfo.nombre, data.contactInfo.apellidos]
    .filter(Boolean)
    .join(" ");
  const addressLine = [
    data.locationInfo.direccion,
    data.locationInfo.numero && `Nº ${data.locationInfo.numero}`,
  ]
    .filter(Boolean)
    .join(" ");
  const cityLine = [
    data.locationInfo.codigoPostal,
    data.locationInfo.localidad,
    data.locationInfo.provincia,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Revisión</h2>
        <p className="text-muted-foreground">
          Revisa los datos antes de enviarlos. Puedes volver atrás para
          editarlos.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-md bg-muted p-4">
          <h3 className="mb-2 font-semibold">Contacto</h3>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <div>
              <span className="font-medium">Nombre:</span> {fullName || "—"}
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              {data.contactInfo.email}
            </div>
            <div>
              <span className="font-medium">Teléfono:</span>{" "}
              {data.contactInfo.telefono}
            </div>
          </div>
        </div>

        <div className="rounded-md bg-muted p-4">
          <h3 className="mb-2 font-semibold">Ubicación</h3>
          <div className="text-sm">
            <div>{addressLine || "—"}</div>
            {cityLine && (
              <div className="text-muted-foreground">{cityLine}</div>
            )}
          </div>
        </div>

        <div className="rounded-md bg-muted p-4">
          <h3 className="mb-2 font-semibold">Inmueble</h3>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            <div>
              <span className="font-medium">Tipo:</span>{" "}
              {propertyTypeLabels[data.propertyInfo.tipo] ?? "—"}
            </div>
            <div>
              <span className="font-medium">Superficie:</span>{" "}
              {data.propertyInfo.superficie
                ? `${data.propertyInfo.superficie} m²`
                : "—"}
            </div>
            <div>
              <span className="font-medium">Precio:</span>{" "}
              {data.economicInfo.precioVenta
                ? `${data.economicInfo.precioVenta} €`
                : "—"}
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={data.acceptTerms}
            onCheckedChange={(checked) => updateTerms(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className={`text-sm font-medium leading-none ${errors.acceptTerms ? "text-red-500" : ""}`}
            >
              Acepto los términos y condiciones
            </Label>
            <p className="text-sm text-muted-foreground">
              Al enviar este formulario, acepto los{" "}
              <Link
                href="/terminos-condiciones-venta"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/proteccion-de-datos"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                política de privacidad
              </Link>
              .
            </p>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500">{errors.acceptTerms}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
