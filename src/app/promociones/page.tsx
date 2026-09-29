import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  searchListings,
  countListings,
  type SortOption,
} from "~/server/queries/listings";
import {
  getPromotionsForAccount,
  getPromotionDetail,
  getPromotionImages,
} from "~/server/queries/promotions";
import { getWatermarkConfig } from "~/server/queries/watermark";
import {
  getModulesConfig,
  getPropertiesConfig,
} from "~/server/queries/website-config";
import { DEFAULT_CARD_DISPLAY } from "~/lib/card-display";
import { PropertyCard } from "~/components/listing-card";
import { PropertyCardSkeleton } from "~/components/property-card-skeleton";
import { PromotionCard } from "~/components/promociones/PromotionCard";
import { PromotionDetailPanel } from "~/components/promociones/PromotionDetailPanel";
import { PromotionGallery } from "~/components/promociones/PromotionGallery";
import { PromotionListingCard } from "~/components/promociones/PromotionListingCard";
import { PromotionDocuments } from "~/components/promociones/PromotionDocuments";
import { Pagination } from "~/components/pagination";
import Footer from "~/components/footer";
import BreadcrumbJsonLd from "~/components/breadcrumb-json-ld";
import { Button } from "~/components/ui/button";

const ITEMS_PER_PAGE = 24;
const PAGE_TITLE = "Promociones";
const PAGE_SUBTITLE = "Obra nueva y desarrollos disponibles";
const SLUG = "promociones";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ promotion?: string; page?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  let title = `${PAGE_TITLE} — Obra nueva y desarrollos`;
  let canonical = `/${SLUG}`;
  if (sp.promotion) {
    const promo = await getPromotionDetail(sp.promotion);
    if (promo) {
      title = `${promo.name} — ${PAGE_TITLE}`;
      canonical = `/${SLUG}?promotion=${sp.promotion}`;
    }
  }
  if (currentPage > 1)
    canonical = `${canonical}${canonical.includes("?") ? "&" : "?"}page=${currentPage}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description:
      "Descubre todas las promociones de obra nueva disponibles y las propiedades que las componen.",
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_SUBTITLE,
      url: canonical,
      type: "website",
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

interface PageProps {
  searchParams: Promise<{ promotion?: string; page?: string }>;
}

export default async function PromocionesPage({ searchParams }: PageProps) {
  const { promotionsEnabled } = await getModulesConfig();
  if (!promotionsEnabled) notFound();
  const propertiesConfig = await Promise.resolve(getPropertiesConfig()).catch(
    () => ({
      showDescription: true,
      showReference: true,
      defaultSort: "default" as const,
      cardDisplay: DEFAULT_CARD_DISPLAY,
    }),
  );
  const showDescription = propertiesConfig.showDescription !== false;
  const showReference = propertiesConfig.showReference !== false;
  const cardDisplay = propertiesConfig.cardDisplay;

  const sp = await searchParams;
  const selectedPromotionId = sp.promotion?.trim() || null;
  const currentPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  // Esta página no expone selector de orden, así que siempre manda el orden
  // configurado por la agencia: `searchListings` lo resuelve al no recibir uno.
  const sort: SortOption = propertiesConfig.defaultSort;

  const filters = selectedPromotionId
    ? { promotionId: selectedPromotionId }
    : { hasPromotion: true };

  const [
    promotions,
    totalCount,
    listings,
    watermarkConfig,
    selectedDetail,
    selectedImages,
  ] = await Promise.all([
    getPromotionsForAccount(),
    countListings(filters),
    searchListings(filters, ITEMS_PER_PAGE, sort, offset),
    getWatermarkConfig(),
    selectedPromotionId
      ? getPromotionDetail(selectedPromotionId)
      : Promise.resolve(null),
    selectedPromotionId
      ? getPromotionImages(selectedPromotionId)
      : Promise.resolve([]),
  ]);

  if (selectedPromotionId && !selectedDetail) notFound();

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  if (currentPage > totalPages && totalPages > 0) notFound();

  const watermarkEnabled = watermarkConfig.enabled && !!watermarkConfig.logoUrl;
  const otherPromotions = selectedDetail
    ? promotions.filter((p) => p.promotionId !== selectedDetail.promotionId)
    : promotions;
  const feedTitle = selectedDetail
    ? `Propiedades en ${selectedDetail.name}`
    : "Propiedades en promoción";
  const paginationExtras = selectedPromotionId
    ? { promotion: selectedPromotionId }
    : undefined;

  return (
    <>
      <BreadcrumbJsonLd
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}
        items={[
          { name: "Inicio", href: "/" },
          { name: PAGE_TITLE, href: `/${SLUG}` },
          ...(selectedDetail
            ? [
                {
                  name: selectedDetail.name,
                  href: `/${SLUG}?promotion=${selectedDetail.promotionId}`,
                },
              ]
            : []),
        ]}
      />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center text-xs font-medium uppercase tracking-eyebrow">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Inicio
                </Link>
              </li>
              <li className="mx-3 text-muted-foreground/50">/</li>
              <li
                className={
                  selectedDetail
                    ? "text-muted-foreground transition-colors hover:text-foreground"
                    : "text-foreground"
                }
                aria-current={selectedDetail ? undefined : "page"}
              >
                {selectedDetail ? (
                  <Link href={`/${SLUG}`}>{PAGE_TITLE}</Link>
                ) : (
                  PAGE_TITLE
                )}
              </li>
              {selectedDetail && (
                <>
                  <li className="mx-3 text-muted-foreground/50">/</li>
                  <li className="text-foreground" aria-current="page">
                    {selectedDetail.name}
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="mb-12 space-y-3">
            <span className="block text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
              Obra nueva
            </span>
            <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {PAGE_TITLE}
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              {PAGE_SUBTITLE}
            </p>
          </div>

          {selectedDetail && (
            <PromotionDetailPanel promotion={selectedDetail} />
          )}

          {selectedDetail && (
            <PromotionGallery
              images={selectedImages}
              promotionName={selectedDetail.name}
            />
          )}

          {!!selectedDetail && selectedDetail.documents.length > 0 && (
            <section className="mb-16">
              <PromotionDocuments documents={selectedDetail.documents} />
            </section>
          )}

          {(() => {
            const promotionsBlock =
              otherPromotions.length > 0 ? (
                <section
                  aria-labelledby="promotions-heading"
                  className="mb-16"
                  key="promotions-block"
                >
                  {selectedDetail && (
                    <div className="mb-6 flex items-end justify-between gap-4">
                      <h2
                        id="promotions-heading"
                        className="text-xl font-medium tracking-tight text-foreground sm:text-2xl"
                      >
                        Otras promociones
                      </h2>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs font-medium uppercase tracking-eyebrow"
                      >
                        <Link href={`/${SLUG}`}>Ver todas</Link>
                      </Button>
                    </div>
                  )}
                  {/*
                    Filas justificadas, no rejilla: dentro de una fila todas
                    las portadas miden lo mismo de alto y cada tarjeta ocupa el
                    ancho que pide su imagen (ver `PromotionCard`). El comodín
                    del final absorbe el hueco de la última fila.
                  */}
                  <div className="flex flex-wrap gap-6 lg:gap-8">
                    {otherPromotions.map((promo) => (
                      <PromotionCard
                        key={promo.promotionId}
                        promotion={promo}
                        selected={false}
                      />
                    ))}
                    <div aria-hidden className="grow-[9999] basis-0" />
                  </div>
                </section>
              ) : (
                !selectedDetail && (
                  <section
                    className="mb-16 rounded-2xl border border-border/60 bg-muted/30 px-6 py-12 text-center"
                    key="promotions-empty"
                  >
                    <p className="text-base text-muted-foreground">
                      No hay promociones disponibles en este momento.
                    </p>
                  </section>
                )
              );

            const listingsBlock = (
              <section
                aria-labelledby="listings-heading"
                className={selectedDetail ? "mb-16" : undefined}
                key="listings-block"
              >
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2
                      id="listings-heading"
                      className="text-xl font-medium tracking-tight text-foreground sm:text-2xl"
                    >
                      {feedTitle}
                    </h2>
                    {totalCount > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {totalCount} propiedades
                        {totalPages > 1 &&
                          ` — Página ${currentPage} de ${totalPages}`}
                      </p>
                    )}
                  </div>
                </div>

                {listings.length === 0 ? (
                  <div className="rounded-2xl border border-border/60 bg-muted/30 px-6 py-12 text-center">
                    <p className="text-base text-muted-foreground">
                      {selectedDetail
                        ? "Las viviendas de esta promoción todavía no están publicadas. Escríbenos y te informamos en cuanto salgan."
                        : "No hay propiedades en promoción en este momento."}
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedDetail ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                        {listings.map((listing) => (
                          <PromotionListingCard
                            key={listing.listingId.toString()}
                            listing={listing}
                            watermarkEnabled={watermarkEnabled}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
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
                      slugString={SLUG}
                      currentSort={sort}
                      defaultSort={propertiesConfig.defaultSort}
                      extraParams={paginationExtras}
                    />
                  </>
                )}
              </section>
            );

            return selectedDetail ? (
              <>
                {listingsBlock}
                {promotionsBlock}
              </>
            ) : (
              <>
                {promotionsBlock}
                {listingsBlock}
              </>
            );
          })()}
        </div>
        <Footer />
      </main>
    </>
  );
}
