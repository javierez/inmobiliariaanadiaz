import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "~/components/footer";
import { PropertyCard } from "~/components/listing-card";
import { Pagination } from "~/components/pagination";
import { PromotionCard } from "~/components/promociones/PromotionCard";
import {
  findPromoCardBySlug,
  resolvePromoCardBySlug,
} from "~/server/queries/promo-cards";
import { getWatermarkConfig } from "~/server/queries/watermark";
import { getPropertiesConfig } from "~/server/queries/website-config";
import { DEFAULT_CARD_DISPLAY } from "~/lib/card-display";

// Mismo tamaño de página que `/inversiones`, `/promociones` y el buscador, para
// que una colección no se vea distinta al resto del sitio.
const ITEMS_PER_PAGE = 24;

function parsePage(raw: string | undefined): number {
  return Math.max(1, parseInt(raw ?? "1", 10) || 1);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const card = await findPromoCardBySlug(slug);
  if (!card) return { title: "Colección" };

  const currentPage = parsePage(sp.page);
  const path = `/coleccion/${slug}`;
  return {
    title:
      currentPage > 1 ? `${card.title} — Página ${currentPage}` : card.title,
    description: card.subtitle || card.title,
    alternates: {
      canonical: currentPage > 1 ? `${path}?page=${currentPage}` : path,
    },
  };
}

export default async function ColeccionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const currentPage = parsePage(sp.page);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const resolved = await resolvePromoCardBySlug(slug, ITEMS_PER_PAGE, offset);
  if (!resolved) notFound();

  const [watermark, propertiesConfig] = await Promise.all([
    getWatermarkConfig(),
    Promise.resolve(getPropertiesConfig()).catch(() => ({
      showDescription: true,
      showReference: true,
      cardDisplay: DEFAULT_CARD_DISPLAY,
    })),
  ]);
  const showDescription = propertiesConfig.showDescription !== false;
  const showReference = propertiesConfig.showReference !== false;
  const cardDisplay = propertiesConfig.cardDisplay;

  const total =
    resolved.kind === "listing_query" || resolved.kind === "promotion_query"
      ? resolved.total
      : 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  // `?page=99` en una colección de dos páginas es un 404, no una rejilla vacía:
  // así no se indexan páginas huecas.
  if (currentPage > totalPages && totalPages > 0) notFound();

  const itemsLabel =
    resolved.kind === "promotion_query" ? "promociones" : "propiedades";

  return (
    <>
      <main className="container mx-auto px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-3xl">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            {resolved.card.title}
          </h1>
          {resolved.card.subtitle ? (
            <p className="mt-3 text-base text-muted-foreground">
              {resolved.card.subtitle}
            </p>
          ) : null}
          {total > 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              {total} {itemsLabel}
              {totalPages > 1 && ` — Página ${currentPage} de ${totalPages}`}
            </p>
          ) : null}
        </header>

        {resolved.kind === "listing_query" ? (
          resolved.listings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resolved.listings.map((listing, index) => (
                <PropertyCard
                  key={listing.listingId.toString()}
                  listing={listing}
                  index={index}
                  watermarkEnabled={watermark.enabled}
                  showDescription={showDescription}
                  showReference={showReference}
                  cardDisplay={cardDisplay}
                />
              ))}
            </div>
          )
        ) : null}

        {resolved.kind === "promotion_query" ? (
          resolved.promotions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-wrap gap-6">
              {resolved.promotions.map((promotion) => (
                <PromotionCard
                  key={promotion.promotionId}
                  promotion={promotion}
                  selected={false}
                />
              ))}
              <div aria-hidden className="grow-[9999] basis-0" />
            </div>
          )
        ) : null}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          slugString={`coleccion/${slug}`}
          currentSort="default"
        />
      </main>
      <Footer />
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
      No hay resultados para esta colección por el momento.
    </div>
  );
}
