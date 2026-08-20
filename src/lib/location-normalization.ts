/**
 * Location name normalization for Spanish provinces, cities, and neighborhoods.
 *
 * Handles variants like "LEON", "León", "Leon" — grouping them under a single
 * canonical display name with proper Spanish orthography.
 */

/**
 * Converts a location name to a lowercase, accent-free key for grouping.
 * "LEÓN" → "leon", "León" → "leon", "Leon" → "leon"
 */
export function toLocationKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/**
 * Canonical Spanish provinces with proper orthography.
 * Key = toLocationKey(name), Value = correct display name.
 */
export const CANONICAL_PROVINCES: Record<string, string> = {
  alava: "Álava",
  albacete: "Albacete",
  alicante: "Alicante",
  almeria: "Almería",
  asturias: "Asturias",
  avila: "Ávila",
  badajoz: "Badajoz",
  baleares: "Baleares",
  "illes balears": "Baleares",
  "islas baleares": "Baleares",
  barcelona: "Barcelona",
  burgos: "Burgos",
  caceres: "Cáceres",
  cadiz: "Cádiz",
  cantabria: "Cantabria",
  castellon: "Castellón",
  "ciudad real": "Ciudad Real",
  cordoba: "Córdoba",
  cuenca: "Cuenca",
  girona: "Girona",
  granada: "Granada",
  guadalajara: "Guadalajara",
  guipuzcoa: "Guipúzcoa",
  gipuzkoa: "Guipúzcoa",
  huelva: "Huelva",
  huesca: "Huesca",
  jaen: "Jaén",
  "la coruna": "La Coruña",
  "a coruna": "La Coruña",
  "la rioja": "La Rioja",
  "las palmas": "Las Palmas",
  leon: "León",
  lerida: "Lérida",
  lleida: "Lérida",
  lugo: "Lugo",
  madrid: "Madrid",
  malaga: "Málaga",
  murcia: "Murcia",
  navarra: "Navarra",
  ourense: "Ourense",
  orense: "Ourense",
  palencia: "Palencia",
  pontevedra: "Pontevedra",
  salamanca: "Salamanca",
  "santa cruz de tenerife": "Santa Cruz de Tenerife",
  segovia: "Segovia",
  sevilla: "Sevilla",
  soria: "Soria",
  tarragona: "Tarragona",
  teruel: "Teruel",
  toledo: "Toledo",
  valencia: "Valencia",
  valladolid: "Valladolid",
  vizcaya: "Vizcaya",
  bizkaia: "Vizcaya",
  zamora: "Zamora",
  zaragoza: "Zaragoza",
  ceuta: "Ceuta",
  melilla: "Melilla",
};

/**
 * Returns the canonical display name for a province.
 * Falls back to pickBestDisplayName if not in the canonical map.
 */
export function normalizeProvince(raw: string): string {
  const key = toLocationKey(raw);
  // Try direct lookup
  if (CANONICAL_PROVINCES[key]) return CANONICAL_PROVINCES[key];
  // Try stripping common prefixes like "Provincia de"
  const stripped = key.replace(/^provincia de\s+/, "");
  if (CANONICAL_PROVINCES[stripped]) return CANONICAL_PROVINCES[stripped];
  // Fallback
  return pickBestDisplayName([raw]);
}

/**
 * Spanish prepositions/articles that should stay lowercase in title case,
 * unless they are the first word.
 */
const SPANISH_LOWERCASE_WORDS = new Set([
  "de",
  "del",
  "la",
  "las",
  "los",
  "el",
  "en",
  "y",
  "e",
  "o",
  "u",
  "a",
]);

/**
 * Converts a location name to Spanish title case.
 * "LA ROBLA" → "La Robla", "san andres del rabanedo" → "San Andrés del Rabanedo"
 * Keeps prepositions/articles lowercase except when first word.
 */
export function toSpanishTitleCase(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && SPANISH_LOWERCASE_WORDS.has(lower)) {
        return lower;
      }
      // Capitalize first letter, lowercase rest
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

/**
 * Picks the best display name from a set of spelling variants.
 * Prefers: accented > mixed case > title case. Penalizes ALL CAPS.
 * If the best variant is still ALL CAPS or all lowercase, converts to title case.
 */
export function pickBestDisplayName(variants: string[]): string {
  if (variants.length === 0) return "";

  const best =
    variants.length === 1
      ? variants[0]!
      : variants.reduce((a, b) => (scoreVariant(b) > scoreVariant(a) ? b : a));

  // If the best we found is ALL CAPS or all lowercase, fix it
  if (best === best.toUpperCase() || best === best.toLowerCase()) {
    return toSpanishTitleCase(best);
  }

  return best;
}

function scoreVariant(name: string): number {
  let score = 0;
  // Prefer names with diacritics (likely proper Spanish)
  if (/[\u00C0-\u024F]/.test(name)) score += 20;
  // Prefer mixed case over ALL CAPS or all lower
  if (name !== name.toUpperCase() && name !== name.toLowerCase()) score += 10;
  // Prefer title case (first letter uppercase per word)
  const words = name.split(/\s+/);
  const isTitleCase = words.every((w) => /^[A-ZÀ-Ö]/.test(w));
  if (isTitleCase) score += 5;
  // Penalize ALL CAPS
  if (name === name.toUpperCase() && name.length > 1) score -= 10;
  return score;
}
