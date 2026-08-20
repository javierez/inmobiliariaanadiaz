export const CITY_PLACEHOLDER = "{city}";

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalize(value: string): string {
  return stripDiacritics(value).toLowerCase();
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface CityTemplateResult {
  template: string;
  foundCity: string | null;
}

/**
 * Locate a city name inside a free-form string and replace its first occurrence
 * with a `{city}` placeholder. Matching is accent- and case-insensitive so
 * stored strings like "León" match a city list entry stored as "Leon".
 *
 * Longest match wins — prevents "San Sebastián" from beating
 * "San Sebastián de los Reyes" when both are in the list.
 *
 * When no city is found, the original string is returned unchanged with
 * `foundCity = null`; callers should then render the title statically without
 * rotation.
 */
export function extractCityTemplate(
  text: string,
  knownCities: readonly string[],
): CityTemplateResult {
  if (!text || knownCities.length === 0) {
    return { template: text, foundCity: null };
  }

  const normalizedText = normalize(text);

  const sortedCities = [...knownCities]
    .filter((city) => city && city.trim().length > 0)
    .sort((a, b) => b.length - a.length);

  for (const city of sortedCities) {
    const needle = normalize(city);
    if (!needle) continue;

    const pattern = new RegExp(`\\b${escapeRegex(needle)}\\b`, "i");
    const match = pattern.exec(normalizedText);
    if (!match) continue;

    const start = match.index;
    const end = start + match[0].length;

    const template = `${text.slice(0, start)}${CITY_PLACEHOLDER}${text.slice(end)}`;
    return { template, foundCity: city };
  }

  return { template: text, foundCity: null };
}

/** Substitute `{city}` in a template with a concrete city name. */
export function applyCityToTemplate(template: string, city: string): string {
  return template.split(CITY_PLACEHOLDER).join(city);
}
