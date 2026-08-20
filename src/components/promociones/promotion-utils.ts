// Shared price helpers for promotion cards / panels. Mirrors `formatPrice` in
// `~/lib/utils` but returns null for empty/non-positive values so callers can
// hide the price line entirely instead of rendering "0 €".
export function formatPromotionPrice(value: string | null): string | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n);
}

/**
 * La horquilla de precios de la promoción.
 *
 * `priceFrom` es el "desde X €" que la agencia teclea en la propia promoción y
 * sólo entra cuando no hay unidades enlazadas de las que sacar el rango: en
 * cuanto hay viviendas publicadas manda el precio real de esas viviendas.
 */
export function buildPromotionPriceLabel(
  min: string | null,
  max: string | null,
  priceFrom: string | null = null,
): string | null {
  const minF = formatPromotionPrice(min);
  const maxF = formatPromotionPrice(max);
  if (minF && maxF && minF !== maxF) return `${minF} € — ${maxF} €`;
  if (minF) return `Desde ${minF} €`;
  if (maxF) return `Hasta ${maxF} €`;
  const fromF = formatPromotionPrice(priceFrom);
  if (fromF) return `Desde ${fromF} €`;
  return null;
}

// Mismas etiquetas que el CRM (`src/types/promotion.ts`). Sin
// `precommercialization` la web pintaba el valor crudo en inglés al visitante.
const PHASE_LABEL: Record<string, string> = {
  precommercialization: "Precomercialización",
  land_move: "Movimiento de tierras",
  foundation: "Cimentación",
  carpentry: "Carpintería",
  pilot: "Piloto",
  paving: "Pavimentación",
  equipment: "Equipamiento",
  keydelivery: "Entrega de llaves",
};

export function formatPromotionPhase(
  builtPhase: string | null,
): string | null {
  if (!builtPhase) return null;
  return PHASE_LABEL[builtPhase] ?? builtPhase;
}

const MONTH_LABEL = [
  "ene.",
  "feb.",
  "mar.",
  "abr.",
  "may.",
  "jun.",
  "jul.",
  "ago.",
  "sep.",
  "oct.",
  "nov.",
  "dic.",
];

export function formatKeyDelivery(
  year: number | null,
  month: number | null,
): string | null {
  if (!year) return null;
  if (month && month >= 1 && month <= 12)
    return `${MONTH_LABEL[month - 1]} ${year}`;
  return `${year}`;
}

/** `start_date` se guarda como texto "YYYY/MM/DD" (o "YYYY-MM-DD"). */
export function formatPromotionStartDate(value: string | null): string | null {
  if (!value) return null;
  const m = /^(\d{4})[/-](\d{1,2})(?:[/-](\d{1,2}))?$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return `${year}`;
  const day = m[3] ? Number(m[3]) : null;
  const monthLabel = MONTH_LABEL[month - 1];
  return day ? `${day} ${monthLabel} ${year}` : `${monthLabel} ${year}`;
}

/**
 * Qué se dice del inventario de una promoción.
 *
 * Con cero unidades enlazadas no se escribe "0 unidades" — la obra nueva en
 * precomercialización todavía no tiene viviendas dadas de alta y ese cero se
 * lee como "no queda nada". Se cuenta la fase de obra, y si tampoco la hay,
 * "Próximamente".
 */
export function buildPromotionUnitsLabel(
  listingCount: number,
  builtPhase: string | null,
): string {
  if (listingCount > 0)
    return `${listingCount} ${listingCount === 1 ? "unidad" : "unidades"}`;
  return formatPromotionPhase(builtPhase) ?? "Próximamente";
}
