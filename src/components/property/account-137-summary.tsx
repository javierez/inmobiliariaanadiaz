import Link from "next/link";
import { Bed, Bath, SquareIcon, MapPin, Waves } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { PropertyActionBar } from "~/components/property/property-action-bar";

interface Account137SummaryProps {
  title: string;
  /** Pre-formatted location text (zona). */
  address: string;
  /** Google Maps query for the zona link. */
  mapsQuery: string;
  /** Listing reference shown as "Ref." */
  reference: string;
  /**
   * Pre-formatted price label, e.g. "2.000.000€" or "A consultar". `null` when
   * the price is hidden (fc_price_visibility on a sold/rented listing) — the
   * whole "Precio:" row is then omitted.
   */
  priceLabel: string | null;
  /** Pre-formatted price per m² label, or null when not applicable. */
  pricePerM2Label: string | null;
  /** Badge text: "En Venta" / "En Alquiler". */
  statusLabel: string;
  bedrooms: number;
  bathrooms: number;
  squareMeter: number;
  hasPool: boolean;
  /** Href for the "Ir al buscador" button (property search). */
  searchHref: string;
  // Action bar wiring
  fotosAnchor: string;
  mapaAnchor: string;
  hasTour: boolean;
  tourAnchor: string;
  hasVideo: boolean;
  videoAnchor: string;
}

/**
 * Gilmar-style property summary for account 137. Mirrors the reference page
 * (gilmar.es): an "Ir al buscador" pill + a centered quick-action bar at the
 * top, then a serif title, the zona / reference / price / €/m² grid, and the
 * key characteristics (m² · dormitorios · baños · piscina) sitting inline
 * between two hairline rules. Borderless and airy — no card chrome — to match
 * the reference's clean editorial look.
 *
 * Gated to account 137 by the caller — see lib/account-overrides/137.ts.
 */
export function Account137Summary({
  title,
  address,
  mapsQuery,
  reference,
  priceLabel,
  pricePerM2Label,
  statusLabel,
  bedrooms,
  bathrooms,
  squareMeter,
  hasPool,
  searchHref,
  fotosAnchor,
  mapaAnchor,
  hasTour,
  tourAnchor,
  hasVideo,
  videoAnchor,
}: Account137SummaryProps) {
  const hasCharacteristics =
    squareMeter > 0 || bedrooms > 0 || bathrooms > 0 || hasPool;

  return (
    <article className="mx-auto max-w-3xl">
      {/* Ir al buscador */}
      <div className="flex justify-center print:hidden">
        <Link
          href={searchHref}
          className="rounded-full border border-primary/40 px-8 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Ir al buscador
        </Link>
      </div>

      {/* Barra de acciones (Foto · 3D · Mapa · Video · Descargar · Compartir) */}
      <div className="mt-6">
        <PropertyActionBar
          fotosAnchor={fotosAnchor}
          mapaAnchor={mapaAnchor}
          hasTour={hasTour}
          tourAnchor={tourAnchor}
          hasVideo={hasVideo}
          videoAnchor={videoAnchor}
        />
      </div>

      {/* Título — serif (Playfair) */}
      <h1 className="font-cinzel mt-8 text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h1>

      {/* Zona · Ref · Precio · €/m² */}
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          <MapPin className="mr-1.5 h-4 w-4 shrink-0 text-primary" />
          <span className="truncate whitespace-nowrap">{address}</span>
        </a>
        <div className="text-xl text-muted-foreground sm:text-right sm:text-base">
          <span className="font-bold text-foreground">Ref.</span>{" "}
          <span className="font-medium text-foreground">{reference}</span>
        </div>

        {priceLabel !== null && (
          <div className="text-xl font-bold text-price">
            Precio: <span>{priceLabel}</span>
          </div>
        )}
        {pricePerM2Label && (
          <div className="text-muted-foreground sm:text-right">
            Precio por m²:{" "}
            <span className="font-medium text-foreground">
              {pricePerM2Label}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Badge>{statusLabel}</Badge>
      </div>

      {/* Características — fila en línea entre dos hairlines */}
      {hasCharacteristics && (
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-primary/20 py-5">
          {squareMeter > 0 && (
            <Characteristic
              icon={<SquareIcon className="h-5 w-5 text-primary" />}
              label={`${squareMeter.toLocaleString("es-ES")} m²`}
            />
          )}
          {bedrooms > 0 && (
            <Characteristic
              icon={<Bed className="h-5 w-5 text-primary" />}
              label={`${bedrooms}`}
            />
          )}
          {bathrooms > 0 && (
            <Characteristic
              icon={<Bath className="h-5 w-5 text-primary" />}
              label={`${bathrooms}`}
            />
          )}
          {hasPool && (
            <Characteristic
              icon={<Waves className="h-5 w-5 text-primary" />}
              label="Sí"
            />
          )}
        </div>
      )}
    </article>
  );
}

function Characteristic({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
