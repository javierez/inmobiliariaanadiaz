import type { MetadataRoute } from "next";
import {
  getAllListingSitemapData,
  getDistinctSearchCombinations,
} from "~/server/queries/listings";
import { buildSearchSlug } from "~/lib/search-utils";
import type { PropertyType } from "~/lib/search-utils";
import { buildPropertySlug } from "~/lib/property-slug";
import { getContactProps } from "~/server/queries/contact";

export const revalidate = 3600;

// Matches the normalize() used in src/app/contacto/[ciudad]/page.tsx so the
// slugs we emit here resolve to real office matches at request time.
function citySlug(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  // Fetch data in parallel
  const [listingData, searchCombos, contactProps] = await Promise.all([
    getAllListingSitemapData(),
    getDistinctSearchCombinations(),
    getContactProps(),
  ]);

  // Static pages
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/vender`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/proteccion-de-datos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/terminos-condiciones-venta`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Property pages — SEO-friendly slugs with trailing numeric id
  const propertyPages: MetadataRoute.Sitemap = listingData.map((listing) => ({
    url: `${baseUrl}/propiedades/${buildPropertySlug(listing)}`,
    lastModified: listing.updatedAt ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Search landing pages from distinct combinations
  const searchPages: MetadataRoute.Sitemap = searchCombos.map((combo) => ({
    url: `${baseUrl}/${buildSearchSlug({
      propertyType: combo.propertyType as PropertyType,
      location: combo.city,
      status: combo.status,
    })}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Per-office city contact pages (/contacto/[ciudad])
  const officeCitySlugs = Array.from(
    new Set(
      (contactProps?.offices ?? [])
        .map((office) => citySlug(office.address.city ?? ""))
        .filter(Boolean),
    ),
  );
  const contactCityPages: MetadataRoute.Sitemap = officeCitySlugs.map(
    (slug) => ({
      url: `${baseUrl}/contacto/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  return [
    ...staticPages,
    ...propertyPages,
    ...searchPages,
    ...contactCityPages,
  ];
}
