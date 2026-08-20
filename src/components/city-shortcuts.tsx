import Link from "next/link";
import { Building2, Key } from "lucide-react";
import { getHeroCities } from "~/server/queries/hero";
import { buildSearchSlug } from "~/lib/search-utils";

export default async function CityShortcuts() {
  const cities = await getHeroCities();
  if (!cities || cities.length === 0) return null;

  return (
    <section
      aria-labelledby="city-shortcuts-heading"
      className="py-12 sm:py-16"
    >
      <div className="mb-8 text-center">
        <h2
          id="city-shortcuts-heading"
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Busca por ciudad
        </h2>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Explora propiedades en venta y alquiler en nuestras zonas de actuación
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => {
          const ventaHref = `/${buildSearchSlug({
            status: "for-sale",
            cities: [city],
          })}`;
          const alquilerHref = `/${buildSearchSlug({
            status: "for-rent",
            cities: [city],
          })}`;

          return (
            <div
              key={city}
              className="rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <h3 className="mb-3 text-lg font-medium">{city}</h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link
                  href={ventaHref}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  <span>Propiedades en venta en {city}</span>
                </Link>
                <Link
                  href={alquilerHref}
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Key className="h-4 w-4" aria-hidden="true" />
                  <span>Propiedades en alquiler en {city}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
