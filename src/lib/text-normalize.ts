/**
 * Pure, client-safe text normalizers shared by the server-side SQL search
 * helper (`server/queries/text-search.ts`) and any client-side filtering.
 * Kept in their own module so importing them into a "use client" component
 * never drags in `~/server/db/schema`.
 *
 * Ported from vesta-crm (`src/lib/text-normalize.ts` / `src/lib/search-utils.ts`)
 * so the public site folds text exactly the way the CRM search does.
 */

/**
 * Lowercases, strips accents/diacritics and common punctuation, and collapses
 * whitespace — the canonical search folding used across the app. Mirrors the
 * Postgres `LOWER(unaccent(...))` matching so the tokens we send agree with
 * what the database compares them against.
 * Example: "José García-Pérez" → "jose garcia perez"
 */
export function normalizeSearchText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .replace(/[.,\-'"`()]/g, "") // Remove common punctuation
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
}

/**
 * Detect a query that is *entirely* a bare amount, so it can additionally match
 * on price. Returns null when anything else is present — "piso 300k" or "leon"
 * are left to the normal text paths.
 *
 * Examples:
 *   "300000"     → 300000
 *   "300.000€"   → 300000
 *   "300 000 €"  → 300000
 *   "300k"       → 300000
 *   "piso 300k"  → null
 *   "leon"       → null
 */
export function parseNumericQuery(
  query: string | null | undefined,
): number | null {
  if (!query) return null;
  // normalizeSearchText strips the "." / "," thousands separators and accents;
  // we additionally drop the € sign and any whitespace, leaving just digits and
  // an optional trailing "k".
  const cleaned = normalizeSearchText(query)
    .replace(/€/g, "")
    .replace(/\s+/g, "");
  const match = /^(\d+)(k?)$/.exec(cleaned);
  if (!match) return null;
  const base = Number.parseInt(match[1]!, 10);
  if (Number.isNaN(base)) return null;
  return match[2] === "k" ? base * 1000 : base;
}
