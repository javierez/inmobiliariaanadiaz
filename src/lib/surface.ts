/**
 * Surface-area helpers.
 *
 * Properties carry two surface columns and **land flips their meaning**:
 *
 *                     | solar / terreno / parcela   | everything else
 *   square_meter      | "Edificable"  (buildable)   | "Superficie útil"
 *   built_surface_area| "Superficie de parcela"     | "Construida"
 *
 * This is not a guess — it is what the CRM's own form labels say
 * (property-details-card.tsx), what the Idealista feed sends as
 * `featuresAreaPlot`, and what Fotocasa reads for FeatureId 69 (land area).
 * Idealista de-lists land that arrives without a plot area.
 *
 * So the single displayable surface is the PLOT on land and the useful area
 * everywhere else. Zero counts as missing: 1.470 of 2.591 solares carry no
 * `square_meter` at all, and a bare `??`/COALESCE would let a literal 0 through
 * and print "0 m²".
 *
 * Keep in sync with:
 *   - `surfaceSqlExpr()` below (the SQL twin used for filtering/sorting)
 *   - vesta/src/lib/properties/area-utils.ts (the CRM's canonical version)
 */

/** Property types where `built_surface_area` holds the PLOT, not the built area. */
export const LAND_PROPERTY_TYPES: ReadonlySet<string> = new Set([
  "solar",
  "terreno",
  "parcela",
]);

export function isLandType(propertyType: string | null | undefined): boolean {
  return !!propertyType && LAND_PROPERTY_TYPES.has(propertyType);
}

/** Treat 0/NaN/null as "no value" — a stored 0 means unknown, not zero m². */
function positive(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * The surface to display for a listing, in m².
 *
 * @param propertyType - REQUIRED to get land right. Passing it as the first
 *   argument is deliberate: the previous signature omitted it entirely, so
 *   every land listing resolved to its buildable area.
 */
export function resolveSquareMeter(
  propertyType: string | null | undefined,
  squareMeter: number | null | undefined,
  builtSurfaceArea: string | number | null | undefined,
): number | null {
  const useful = positive(squareMeter);
  const built = positive(builtSurfaceArea);

  const primary = isLandType(propertyType) ? built : useful;
  const fallback = isLandType(propertyType) ? useful : built;

  const chosen = primary ?? fallback;
  return chosen === null ? null : Math.round(chosen);
}

/**
 * SQL twin of `resolveSquareMeter`, for WHERE/ORDER BY. Must stay identical in
 * behaviour — otherwise the list filters on a number the card doesn't show.
 *
 * Takes the already-qualified column references so the caller controls the
 * table alias.
 */
export function surfaceSqlExpr(
  propertyTypeCol: string,
  squareMeterCol: string,
  builtSurfaceAreaCol: string,
): string {
  return `CASE WHEN ${propertyTypeCol} IN ('solar','terreno','parcela')
            THEN COALESCE(NULLIF(${builtSurfaceAreaCol}, 0), NULLIF(${squareMeterCol}, 0))
            ELSE COALESCE(NULLIF(${squareMeterCol}, 0), NULLIF(${builtSurfaceAreaCol}, 0))
          END`;
}
