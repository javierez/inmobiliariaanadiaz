"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Building,
  Home,
  Layers,
  ArrowRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { staggerItem } from "~/lib/animations";
import type { PromotionCardData } from "~/server/queries/promotions";
import {
  buildPromotionPriceLabel,
  buildPromotionUnitsLabel,
  formatKeyDelivery,
} from "./promotion-utils";
import { PromotionCover } from "./PromotionCover";

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

interface Props {
  promotion: PromotionCardData;
  selected: boolean;
}

/**
 * Hasta dónde puede estirarse el hueco de la imagen para parecerse a su
 * portada.
 *
 * La rejilla es tipo Pinterest: cada tarjeta adopta la forma de su imagen en
 * vez de imponerles a todas un 4/5. Los topes sólo evitan los extremos — un
 * panorama que quedaría en una rendija, o un cartel vertical que se comería la
 * pantalla. Dentro de ese rango la imagen se ve entera y sin marco.
 */
const ASPECT_MIN = 0.6;
const ASPECT_MAX = 1.9;
const ASPECT_FALLBACK = 4 / 5;

export function PromotionCard({ promotion, selected }: Props) {
  const typeLabel = promotion.newDevelopmentType
    ? (TYPE_LABEL[promotion.newDevelopmentType] ?? "Promoción")
    : "Promoción";
  const TypeIcon = promotion.newDevelopmentType
    ? (TYPE_ICON[promotion.newDevelopmentType] ?? Building2)
    : Building2;
  const priceLabel = buildPromotionPriceLabel(
    promotion.minPrice,
    promotion.maxPrice,
    promotion.priceFrom,
  );
  const unitsLabel = buildPromotionUnitsLabel(
    promotion.listingCount,
    promotion.builtPhase,
  );
  const keyDelivery = formatKeyDelivery(
    promotion.keyDeliveryYear,
    promotion.keyDeliveryMonth,
  );
  const street = promotion.street?.trim() ?? "";
  const aspect = Math.min(
    ASPECT_MAX,
    Math.max(ASPECT_MIN, promotion.mainImageAspect ?? ASPECT_FALLBACK),
  );

  const href = selected
    ? "/promociones"
    : `/promociones?promotion=${promotion.promotionId}`;

  return (
    // Fila justificada: todas las tarjetas de una fila comparten alto de
    // imagen y cada una ocupa el ancho que pide su portada. `flex-basis` y
    // `flex-grow` van los dos en proporción a la forma, que es lo que hace que
    // los altos coincidan. `min-w` evita la tarjeta-rendija en la que no cabe
    // el nombre de la promoción.
    <motion.div
      variants={staggerItem}
      style={{
        flexGrow: aspect,
        flexBasis: `calc(var(--card-h) * ${aspect})`,
      }}
      className="min-w-[17rem] [--card-h:13rem] sm:[--card-h:15rem] lg:[--card-h:17rem]"
    >
      <Link
        href={href}
        scroll={false}
        className={cn(
          "group block h-full overflow-hidden rounded-2xl border bg-background transition-all",
          selected
            ? "border-foreground ring-2 ring-foreground/30"
            : "border-border/60 hover:border-foreground/40",
        )}
        aria-pressed={selected}
      >
        {/*
          El texto va DEBAJO de la imagen, no encima. Con el rótulo superpuesto
          la tarjeta tenía que ser alta para dejarle sitio, y en una portada
          apaisada el velo negro tapaba medio edificio. Separados, el hueco de
          la imagen puede adoptar la forma exacta de la foto.
        */}
        <div
          className="relative overflow-hidden bg-muted/40"
          style={{ aspectRatio: aspect }}
        >
          {promotion.mainImageUrl ? (
            <PromotionCover
              src={promotion.mainImageUrl}
              alt={promotion.name}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="transition-transform duration-500 group-hover:scale-105"
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

        <div className="p-5 sm:p-6">
          <h3 className="text-xl font-medium tracking-tight text-foreground sm:text-2xl">
            {promotion.name}
          </h3>
          {street && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{street}</span>
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{unitsLabel}</span>
            {priceLabel && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="text-foreground">{priceLabel}</span>
              </>
            )}
          </div>
          {keyDelivery && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              Entrega {keyDelivery}
            </p>
          )}
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-eyebrow text-foreground">
            {selected
              ? "Quitar filtro"
              : promotion.listingCount > 0
                ? "Ver propiedades"
                : "Ver promoción"}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
