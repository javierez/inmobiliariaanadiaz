"use server";

export type CityFaqItem = { q: string; a: string };

export type CityContent = {
  intro: string;
  faq: CityFaqItem[];
  heroImage?: string;
};

export type CityContentMap = Record<string, CityContent>;

// `website_config.city_content` was removed from the schema. Until it returns,
// city-specific intro/FAQ blocks are unavailable — return null so search pages
// fall back to their default copy.
export async function getCityContent(
  _citySlug: string,
): Promise<CityContent | null> {
  return null;
}
