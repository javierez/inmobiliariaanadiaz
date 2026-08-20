import type { Metadata } from "next";
import Link from "next/link";
import {
  searchListings,
  countListings,
  findListingByExactReference,
  type SearchFilters,
  type SortOption,
} from "~/server/queries/listings";
import { PropertyCard } from "~/components/listing-card";
import { getProvinces, getPriceRange } from "~/server/actions/locations";
import { getWatermarkConfig } from "~/server/queries/watermark";
import { getPropertiesConfig } from "~/server/queries/website-config";
import { DEFAULT_CARD_DISPLAY } from "~/lib/card-display";
import { env } from "~/env";
import { PropertyCardSkeleton } from "~/components/property-card-skeleton";
import {
  parseSearchSlug,
  normalizePropertyTypes,
  type PropertyType,
} from "~/lib/search-utils";
import Footer from "~/components/footer";
import { SearchBar } from "~/components/search-bar";
import { SortDropdown } from "~/components/sort-dropdown";
import { Pagination } from "~/components/pagination";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import BreadcrumbJsonLd from "~/components/breadcrumb-json-ld";
import { FeedViewToggle } from "~/components/propiedades/FeedViewToggle";
import { PropertyFeed } from "~/components/propiedades/PropertyFeed";
import { MapViewToggle } from "~/components/propiedades/MapViewToggle";
import { PropertyMap } from "~/components/propiedades/maps/property-map";
import { CityIntro } from "~/components/city/city-intro";
import { CityFaq } from "~/components/city/city-faq";
import FaqJsonLd from "~/components/city/faq-json-ld";
import { getCityContent } from "~/server/queries/city-content";
import { isAccount137 } from "~/lib/account-overrides/137";

const ITEMS_PER_PAGE = 24;
const MAP_VIEW_LIMIT = 500;

const PROPERTY_TYPE_PLURAL: Record<Exclude<PropertyType, "any">, string> = {
  piso: "Pisos",
  casa: "Casas",
  local: "Locales",
  solar: "Terrenos",
  garaje: "Garajes",
  edificio: "Edificios",
  oficina: "Oficinas",
  industrial: "Naves Industriales",
  trastero: "Trasteros",
  "terreno-industrial": "Terrenos Industriales",
};

function buildPropertyTypeTitle(
  types: Exclude<PropertyType, "any">[],
  status: "for-sale" | "for-rent" | "any",
): string {
  // "Solar" is sale-only; if it's the only selected type and rent is requested,
  // we still keep the rent suffix to match what the URL expresses. Status "any"
  // (the "todo" slug) spans both, so it gets no operation suffix at all.
  const suffix =
    status === "any" ? "" : status === "for-rent" ? "en Alquiler" : "en Venta";
  const labels = types.map((t) => PROPERTY_TYPE_PLURAL[t]);
  let joined: string;
  if (labels.length === 1) {
    joined = labels[0]!;
  } else {
    joined = `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
  }
  return suffix ? `${joined} ${suffix}` : joined;
}

// Generate dynamic metadata based on search parameters
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ sort?: string; page?: string; q?: string }>;
}): Promise<Metadata> {
  const unwrappedParams = await params;
  const unwrappedSearchParams = await searchParams;
  const slugString = unwrappedParams.slug.join("/");
  const currentPage = Math.max(
    1,
    parseInt(unwrappedSearchParams.page ?? "1", 10) || 1,
  );
  const query = unwrappedSearchParams.q?.trim();

  // Free-text results are an unbounded URL space — never index them, and don't
  // advertise a canonical that varies per query.
  if (query) {
    return {
      metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
      ),
      title: `Resultados para «${query}»`,
      description: `Propiedades que coinciden con «${query}».`,
      robots: { index: false, follow: true },
    };
  }
  const parsedParams = parseSearchSlug(slugString);
  const {
    location = "",
    status = "for-sale",
    isOportunidad,
    isBankOwned,
    isFeatured,
  } = parsedParams;
  const selectedTypes = normalizePropertyTypes(parsedParams.propertyType);

  // Build title and description based on search parameters
  let title = "Propiedades";
  let description = "Explora nuestras propiedades disponibles.";

  if (status === "for-rent") {
    title = "Propiedades en Alquiler";
    description =
      "Encuentra propiedades en alquiler en las mejores ubicaciones.";
  } else if (status === "for-sale") {
    title = "Propiedades en Venta";
    description =
      "Descubre propiedades en venta que se adaptan a tus necesidades.";
  }

  if (selectedTypes.length > 0) {
    title = buildPropertyTypeTitle(selectedTypes, status);
  }

  // Handle oportunidad filter
  if (isOportunidad) {
    title += " - Oportunidad";
    description = "Descubre nuestras mejores oportunidades inmobiliarias.";
  }

  if (isBankOwned) {
    title += " - Origen Bancario";
    description = "Descubre nuestras propiedades de origen bancario.";
  }

  if (isFeatured) {
    title += " - Destacados";
    description = "Descubre nuestras propiedades destacadas.";
  }

  if (location && location !== "todas-ubicaciones") {
    const locationName = decodeURIComponent(location.replace(/-/g, " "));
    const capitalizedLocationName =
      locationName.charAt(0).toUpperCase() + locationName.slice(1);
    title += ` en ${capitalizedLocationName}`;
    description += ` en ${capitalizedLocationName}.`;
  }

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
    ),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${slugString}`,
      type: "website",
    },
    alternates: {
      canonical:
        currentPage > 1
          ? `/${slugString}?page=${currentPage}`
          : `/${slugString}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

interface SearchPageProps {
  params: Promise<{
    slug: string[];
  }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
    vista?: string;
    q?: string;
  }>;
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  // Join the slug array into a single string
  const unwrappedParams = await params;
  const unwrappedSearchParams = await searchParams;
  const slugString = unwrappedParams.slug.join("/");
  const validSorts: SortOption[] = [
    "default",
    "newest",
    "oldest",
    "price-asc",
    "price-desc",
    "size-asc",
    "size-desc",
  ];
  // `undefined` cuando el visitante no ha elegido: `searchListings` aplica
  // entonces el orden configurado por la agencia. Para la UI (etiqueta activa y
  // construcción de URLs) se resuelve más abajo, ya con la config cargada.
  const sort: SortOption | undefined = validSorts.includes(
    unwrappedSearchParams.sort as SortOption,
  )
    ? (unwrappedSearchParams.sort as SortOption)
    : undefined;
  const isFeedView = unwrappedSearchParams.vista === "feed";
  const isMapView = unwrappedSearchParams.vista === "mapa";
  const query = unwrappedSearchParams.q?.trim() ?? "";

  // A whitespace-free query might be a reference someone pasted off a card
  // ("Ref. PA-1023"). If it resolves to exactly one listing, go straight there
  // — this is what the old "Busca por referencia" box did, and losing it would
  // be a regression. Ambiguous or non-matching input falls through to results.
  if (query && !/\s/.test(query)) {
    const listingId = await findListingByExactReference(query);
    // Redirect to the bare id — the detail page already 301s that to its
    // canonical slug (see propiedades/[id]/page.tsx), so there's no point
    // rebuilding a partial slug here that would only get rewritten again.
    if (listingId) redirect(`/propiedades/${listingId}`);
  }

  // Parse the slug to get search parameters
  const parsedParams = parseSearchSlug(slugString);

  // Destructure search parameters
  const {
    location = "",
    cities,
    neighborhoodIds,
    province,
    bedrooms = "any",
    bathrooms = "any",
    status = "for-sale",
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    isOportunidad,
    isBankOwned,
    isFeatured,
    amenities,
  } = parsedParams;
  const selectedTypes = normalizePropertyTypes(parsedParams.propertyType);

  // Build search filters
  const searchFilters: SearchFilters = {
    location: location || undefined,
    cities: cities && cities.length > 0 ? cities : undefined,
    neighborhoodIds:
      neighborhoodIds && neighborhoodIds.length > 0
        ? neighborhoodIds
        : undefined,
    province: province && province !== "all" ? province : undefined,
    propertyType: selectedTypes.length > 0 ? selectedTypes : undefined,
    // "any" (the "todo" slug) means no listing-type constraint at all, so a
    // reference lookup finds sales and rentals alike.
    status: status === "any" ? undefined : status,
    q: query || undefined,
    bedrooms: bedrooms === "any" ? undefined : parseInt(bedrooms),
    bathrooms: bathrooms === "any" ? undefined : parseInt(bathrooms),
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    isOportunidad,
    isBankOwned,
    isFeatured,
    amenities: amenities && amenities.length > 0 ? amenities : undefined,
  };

  // Pagination
  const currentPage = Math.max(
    1,
    parseInt(unwrappedSearchParams.page ?? "1", 10) || 1,
  );
  // Map view shows every match on the map, so it sidesteps pagination and pulls
  // a larger batch in one go (capped by MAP_VIEW_LIMIT).
  const pageSize = isMapView ? MAP_VIEW_LIMIT : ITEMS_PER_PAGE;
  const offset = isMapView ? 0 : (currentPage - 1) * ITEMS_PER_PAGE;

  // Get data for search bar
  const accountId = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);
  const citySlugForContent =
    location && location !== "todas-ubicaciones" ? location : null;
  const [
    provinces,
    priceRange,
    totalCount,
    listings,
    watermarkConfig,
    cityContent,
    propertiesConfig,
  ] = await Promise.all([
    getProvinces(accountId),
    getPriceRange(accountId),
    countListings(searchFilters),
    searchListings(searchFilters, pageSize, sort, offset),
    getWatermarkConfig(),
    citySlugForContent
      ? getCityContent(citySlugForContent)
      : Promise.resolve(null),
    Promise.resolve(getPropertiesConfig(accountId)).catch(() => ({
      showDescription: true,
      showReference: true,
      defaultSort: "default" as const,
      cardDisplay: DEFAULT_CARD_DISPLAY,
    })),
  ]);
  const showDescription = propertiesConfig.showDescription !== false;
  const showReference = propertiesConfig.showReference !== false;
  const cardDisplay = propertiesConfig.cardDisplay;
  // El orden que se está mostrando de verdad: el de la URL, o el de la agencia.
  // `defaultSort` viaja a los constructores de URL para que el parámetro solo
  // aparezca cuando difiere del inicial, y las URLs limpias sigan siendo las
  // mismas que hoy en las cuentas que no configuran nada.
  const defaultSort = propertiesConfig.defaultSort;
  const activeSort: SortOption = sort ?? defaultSort;

  // Only surface intro + FAQ on the first page, to keep paginated pages distinct
  // without duplicating the hero content (Google indexes ?page=2 separately).
  const showCityContent = cityContent && currentPage === 1;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // 404 for invalid page numbers (skipped in map view — map shows all matches at once)
  if (!isMapView && currentPage > totalPages && totalPages > 0) {
    notFound();
  }

  const watermarkEnabled = watermarkConfig.enabled && !!watermarkConfig.logoUrl;

  // Hardcoded property types. Account 137 (industrial agency) additionally gets
  // the "terreno-industrial" pseudo-type (Solar + industrial subtype) and shows
  // "industrial" as "Nave" — see PROPERTY_TYPE_LABEL / isAccount137 in the UI.
  const propertyTypes = isAccount137()
    ? [
        "piso",
        "casa",
        "local",
        "solar",
        "garaje",
        "edificio",
        "oficina",
        "industrial",
        "terreno-industrial",
        "trastero",
      ]
    : [
        "piso",
        "casa",
        "local",
        "solar",
        "garaje",
        "edificio",
        "oficina",
        "industrial",
        "trastero",
      ];

  // Ensure priceRange has valid numbers
  const validPriceRange = {
    minPrice: typeof priceRange.minPrice === "number" ? priceRange.minPrice : 0,
    maxPrice:
      typeof priceRange.maxPrice === "number" ? priceRange.maxPrice : 2000000,
  };

  // Build title of the search
  let searchTitle = "Propiedades";

  if (status === "for-rent") {
    searchTitle = "Propiedades en Alquiler";
  } else if (status === "for-sale") {
    searchTitle = "Propiedades en Venta";
  }

  if (selectedTypes.length > 0) {
    searchTitle = buildPropertyTypeTitle(selectedTypes, status);
  }

  // Add "Oportunidad" suffix if filtering by oportunidad
  if (isOportunidad) {
    searchTitle += " - Oportunidad";
  }

  if (isBankOwned) {
    searchTitle += " - Origen Bancario";
  }

  if (isFeatured) {
    searchTitle += " - Destacados";
  }

  let capitalizedCityName: string | null = null;
  if (location && location !== "todas-ubicaciones") {
    const locationName = decodeURIComponent(location.replace(/-/g, " "));
    capitalizedCityName =
      locationName.charAt(0).toUpperCase() + locationName.slice(1);
    searchTitle += ` en ${capitalizedCityName}`;
  }

  // A free-text search owns the heading — the slug facets are incidental here.
  if (query) {
    searchTitle = `Resultados para «${query}»`;
  }

  return (
    <>
      <BreadcrumbJsonLd
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}
        items={[
          { name: "Inicio", href: "/" },
          { name: searchTitle, href: `/${slugString}` },
        ]}
      />
      {/* prev/next are crawler pagination hints. Free-text result pages are
          noindex and their URLs carry ?q=, which these tags would drop —
          pointing crawlers at a different result set. Omit them while searching. */}
      {!query && currentPage > 1 && (
        <link
          rel="prev"
          href={
            currentPage === 2
              ? `/${slugString}`
              : `/${slugString}?page=${currentPage - 1}`
          }
        />
      )}
      {!query && currentPage < totalPages && (
        <link rel="next" href={`/${slugString}?page=${currentPage + 1}`} />
      )}
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="py-4" aria-label="Breadcrumb">
            <ol className="flex items-center text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Inicio
                </Link>
              </li>
              <li className="mx-2">/</li>
              <li className="font-medium" aria-current="page">
                {searchTitle}
              </li>
            </ol>
          </nav>

          <div className="mb-8 mt-8">
            <SearchBar
              initialParams={parsedParams}
              provinces={provinces}
              propertyTypes={propertyTypes}
              priceRange={validPriceRange}
              accountId={env.NEXT_PUBLIC_ACCOUNT_ID}
              query={query || undefined}
            />
          </div>

          <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-bold">{searchTitle}</h1>
              <div className="flex items-center gap-2">
                <MapViewToggle
                  slugString={slugString}
                  currentSort={activeSort}
                  defaultSort={defaultSort}
                  isMapView={isMapView}
                  query={query || undefined}
                />
                {!isMapView && (
                  <FeedViewToggle
                    slugString={slugString}
                    currentSort={activeSort}
                    defaultSort={defaultSort}
                    query={query || undefined}
                  />
                )}
                {!isMapView && (
                  <SortDropdown
                    slugString={slugString}
                    currentSort={activeSort}
                    defaultSort={defaultSort}
                    query={query || undefined}
                  />
                )}
              </div>
            </div>
            <p className="hidden text-muted-foreground sm:block">
              {totalCount} propiedades encontradas
              {!isMapView &&
                totalPages > 1 &&
                ` — Página ${currentPage} de ${totalPages}`}
              {isMapView &&
                totalCount > MAP_VIEW_LIMIT &&
                ` — mostrando las primeras ${MAP_VIEW_LIMIT} en el mapa`}
            </p>
          </div>

          {showCityContent && cityContent && capitalizedCityName && (
            <CityIntro city={capitalizedCityName} intro={cityContent.intro} />
          )}

          {isMapView ? (
            <PropertyMap
              listings={listings}
              watermarkEnabled={watermarkEnabled}
            />
          ) : (
            <>
              {listings.length === 0 ? (
                <div className="rounded-lg border border-dashed py-16 text-center">
                  <p className="text-lg font-medium">
                    {query
                      ? `No encontramos resultados para «${query}»`
                      : "No encontramos propiedades con estos filtros"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {query
                      ? "Revisa la referencia o prueba con menos palabras — por ejemplo, solo la calle o la ciudad."
                      : "Prueba a ampliar la búsqueda."}
                  </p>
                  <Link
                    href="/venta/todas-ubicaciones"
                    className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    Ver todas las propiedades
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Suspense
                    fallback={Array.from({ length: 6 }).map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  >
                    {listings.map((listing, index) => (
                      <PropertyCard
                        key={listing.listingId.toString()}
                        listing={listing}
                        index={index}
                        watermarkEnabled={watermarkEnabled}
                        showDescription={showDescription}
                        showReference={showReference}
                        cardDisplay={cardDisplay}
                      />
                    ))}
                  </Suspense>
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                slugString={slugString}
                currentSort={activeSort}
                defaultSort={defaultSort}
                extraParams={query ? { q: query } : undefined}
              />
            </>
          )}

          {showCityContent && cityContent && capitalizedCityName && (
            <>
              <CityFaq city={capitalizedCityName} faq={cityContent.faq} />
              <FaqJsonLd faq={cityContent.faq} />
            </>
          )}

          {isFeedView && (
            <PropertyFeed
              listings={listings}
              watermarkEnabled={watermarkEnabled}
              slugString={slugString}
              currentSort={activeSort}
              defaultSort={defaultSort}
              query={query || undefined}
            />
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
