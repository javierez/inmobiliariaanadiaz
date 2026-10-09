import Link from "next/link";
import {
  Building2,
  Building,
  Home,
  Layers,
  MapPin,
  Calendar,
  CalendarClock,
  Hammer,
  Zap,
  Waves,
  Trees,
  ArrowUpDown,
  ShieldCheck,
  Bell,
  UserCheck,
  X,
} from "lucide-react";
import type { PromotionDetailData } from "~/server/queries/promotions";
import { PromotionCover } from "./PromotionCover";
import {
  buildPromotionPriceLabel,
  buildPromotionUnitsLabel,
  formatKeyDelivery,
  formatPromotionPhase,
  formatPromotionStartDate,
} from "./promotion-utils";

const TYPE_LABEL: Record<string, string> = {
  new_building: "Edificio nuevo",
  restored_building: "Edificio restaurado",
  house: "Casas",
  mixed_promos: "Mixto",
};

const TYPE_ICON: Record<string, typeof Building2> = {
  new_building: Building2,
  restored_building: Building,
  house: Home,
  mixed_promos: Layers,
};

interface AmenityChipProps {
  icon: typeof Waves;
  label: string;
  active: boolean | null;
}

function AmenityChip({ icon: Icon, label, active }: AmenityChipProps) {
  if (!active) return null;
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-foreground/70" />
      {label}
    </li>
  );
}

export function PromotionDetailPanel({
  promotion,
}: {
  promotion: PromotionDetailData;
}) {
  const TypeIcon = promotion.newDevelopmentType
    ? (TYPE_ICON[promotion.newDevelopmentType] ?? Building2)
    : Building2;
  const typeLabel = promotion.newDevelopmentType
    ? (TYPE_LABEL[promotion.newDevelopmentType] ?? "Promoción")
    : "Promoción";
  const priceLabel = buildPromotionPriceLabel(
    promotion.minPrice,
    promotion.maxPrice,
    promotion.priceFrom,
  );
  // Sin fase: el panel ya la enseña abajo en "Fase de obra", y repetirla aquí
  // arriba sólo hace ruido. Con cero unidades queda "Próximamente".
  const unitsLabel = buildPromotionUnitsLabel(promotion.listingCount, null);

  const addressParts = [
    promotion.street,
    [promotion.postalCode, promotion.city].filter(Boolean).join(" "),
    promotion.province,
  ].filter((p): p is string => !!p && p.trim().length > 0);

  const keyDelivery = formatKeyDelivery(
    promotion.keyDeliveryYear,
    promotion.keyDeliveryMonth,
  );

  const phaseLabel = formatPromotionPhase(promotion.builtPhase);
  const startDate = formatPromotionStartDate(promotion.startDate);

  const outsideAmenities = [
    { icon: Waves, label: "Piscina", active: promotion.hasPool },
    { icon: Trees, label: "Jardín", active: promotion.hasGarden },
  ];
  const insideAmenities = [
    { icon: ArrowUpDown, label: "Ascensor", active: promotion.hasLift },
    {
      icon: ShieldCheck,
      label: "Puerta blindada",
      active: promotion.hasSecurityDoor,
    },
    { icon: Bell, label: "Alarma", active: promotion.hasSecurityAlarm },
    { icon: UserCheck, label: "Conserje", active: promotion.hasDoorman },
  ];

  const hasOutside = outsideAmenities.some((a) => a.active);
  const hasInside = insideAmenities.some((a) => a.active);

  return (
    <section
      aria-labelledby="promotion-detail-heading"
      className="mb-16 overflow-hidden rounded-2xl border border-border/60 bg-background"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Image */}
        <div className="relative aspect-[4/3] lg:col-span-2 lg:aspect-auto">
          {promotion.mainImageUrl ? (
            <PromotionCover
              src={promotion.mainImageUrl}
              alt={promotion.name}
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 bg-[linear-gradient(135deg,_#1f2937_0%,_#475569_55%,_#94a3b8_100%)]"
              aria-hidden
            />
          )}
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-eyebrow text-foreground backdrop-blur-sm">
            <TypeIcon className="h-3.5 w-3.5" />
            {typeLabel}
          </div>
        </div>

        {/* Detail body */}
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="block text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                Promoción seleccionada
              </span>
              <h2
                id="promotion-detail-heading"
                className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
              >
                {promotion.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{unitsLabel}</span>
                {priceLabel && (
                  <>
                    <span className="text-muted-foreground/50">·</span>
                    <span>{priceLabel}</span>
                  </>
                )}
              </div>
            </div>
            <Link
              href="/promociones"
              scroll={false}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/60 px-3 text-xs font-medium uppercase tracking-eyebrow text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Quitar filtro
            </Link>
          </div>

          {/* Status badges */}
          {(promotion.forSale ||
            promotion.forRent ||
            promotion.finished !== null) && (
            <div className="flex flex-wrap gap-2">
              {promotion.forSale && (
                <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground">
                  En venta
                </span>
              )}
              {promotion.forRent && (
                <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground">
                  En alquiler
                </span>
              )}
              {promotion.finished === true && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Terminada
                </span>
              )}
              {promotion.finished === false && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  En construcción
                </span>
              )}
            </div>
          )}

          {/* Key facts grid */}
          {(addressParts.length > 0 ||
            startDate ||
            keyDelivery ||
            phaseLabel ||
            promotion.energyCertificateRating) && (
            <dl className="grid grid-cols-1 gap-4 border-t border-border/60 pt-6 sm:grid-cols-2">
              {addressParts.length > 0 && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                      Ubicación
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {addressParts.join(", ")}
                    </dd>
                  </div>
                </div>
              )}
              {startDate && (
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                      Inicio de obra
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {startDate}
                    </dd>
                  </div>
                </div>
              )}
              {keyDelivery && (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                      Entrega de llaves
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {keyDelivery}
                    </dd>
                  </div>
                </div>
              )}
              {phaseLabel && (
                <div className="flex items-start gap-3">
                  <Hammer className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                      Fase de obra
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {phaseLabel}
                    </dd>
                  </div>
                </div>
              )}
              {promotion.energyCertificateRating && (
                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                      Certificado energético
                    </dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {promotion.energyCertificateRating}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          )}

          {/* Amenities split inside / outside */}
          {(hasOutside || hasInside) && (
            <div className="grid grid-cols-1 gap-6 border-t border-border/60 pt-6 sm:grid-cols-2">
              {hasOutside && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                    Exterior
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {outsideAmenities.map((a) => (
                      <AmenityChip key={a.label} {...a} />
                    ))}
                  </ul>
                </div>
              )}
              {hasInside && (
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
                    Interior
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {insideAmenities.map((a) => (
                      <AmenityChip key={a.label} {...a} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {promotion.description && (
            <p className="border-t border-border/60 pt-6 text-sm leading-relaxed text-muted-foreground">
              {promotion.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
